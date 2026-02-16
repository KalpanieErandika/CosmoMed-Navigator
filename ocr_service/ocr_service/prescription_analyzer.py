from flask import Flask, request, jsonify
from google.cloud import vision
import io #to read image files
import mysql.connector
import re #regular expressions for parsing text
from difflib import SequenceMatcher
import os #file operations
from datetime import datetime

app = Flask(__name__)

class PrescriptionAnalyzer:
    def __init__(self):
        self.db_config = {
            'host': 'localhost',
            'database': 'med',
            'user': 'root',
            'password': '',
            'port': 3306}
        
        self.all_medicines = self.load_all_medicines()
 
        self.dosage_form_abbreviations = {
            'syp': 'syrup', 'syp.': 'syrup', 'cream': 'cream', 
            'la': 'local application', 'l.a': 'local application', 'l.a.': 'local application',
            'tab': 'tablet', 'tab.': 'tablet', 'tablet': 'tablet', 'oral': 'tablet',       
            'inj': 'injection', 'inj.': 'injection', 'injection': 'injection',
            'drop': 'drops', 'drops': 'drops', 
            'oint': 'ointment', 'oint.': 'ointment', 'ointment': 'ointment',
            'gel': 'gel', 'lotion': 'lotion', 'powder': 'powder', 
            'sache': 'sache', 'spray': 'spray'}

        self.ocr_corrections = {
            'hd': 'bd', 'h.d': 'bd', 'h.d.': 'bd', 'had': 'bd', 'had.': 'bd',
            'tod': 'tds', 't.d': 'tds', 'ted': 'tds', 'tad': 'tds', 'tad.': 'tds',
            'qd': 'od', 'q.d': 'od', 'q.d.': 'od', 'ad': 'od', 'ad.': 'od',
            'bid': 'bd', 'b.i.d': 'bd', 'b.i.d.': 'bd','qid': 'qds', 'q.i.d': 'qds', 'q.i.d.': 'qds',
            'b.d': 'bd', 'b.d.': 'bd', 't.d.s': 'tds', 't.d.s.': 'tds','q.d.s': 'qds', 'q.d.s.': 'qds',
            'o.d': 'od', 'o.d.': 'od', 'my': 'mg', 'm9': 'mg', 'm.g': 'mg', 'mg.': 'mg', 'ma': 'mg',
            'ml': 'ml', 'm1': 'ml', 'rnl': 'ml', 'm!': 'ml', 'g': 'g', '9': 'g', 'gr': 'g',
            '%': '%', 'pc': '%', 'p.c': '%','me': 'mg', 'chy': 'tds', 'diely': 'daily', 'nlm': 'tds','hal': 'bd', 'hal.': 'bd', 'be': 'bd'}
        
        self.non_drug_words = {
            'medical', 'center', 'hospital', 'clinic', 'doctor', 'dr', 'mbbs','mr', 'mrs', 'ms', 'patient', 'name', 'age', 'sex', 'male', 'female',
            'date', 'reg', 'no', 'tel', 'fax', 'email', 'web', 'since', 'scanned', 'camera', 'bp', 'hb', 'wbc', 'plt', 'fbs', 'tc', 'ldl', 'tg',
            'date', 'phone', 'sri', 'lanka', 'consultant', 'surgeon', 'cardiologist','teaching', 'slmc'}
    
    def load_all_medicines(self):
        try:
            conn = mysql.connector.connect(**self.db_config)
            cursor = conn.cursor(dictionary=True) #execute sql queries
            cursor.execute("""
    SELECT medicine_id, generic_name, brand_name, Dosage, 
           Manufacturer, pack_size, pack_type, Schedule
    FROM medicines_1 
    WHERE brand_name IS NOT NULL AND brand_name != '***'
    ORDER BY brand_name
""")            
            medicines = cursor.fetchall()
            cursor.close()
            conn.close()
            return medicines
        except Exception as e:
            return []
    
    def detect_text(self, image_path):
        try:
            client = vision.ImageAnnotatorClient() 
            
            with io.open(image_path, "rb") as image_file: #read image
                content = image_file.read() 

            image = vision.Image(content=content) #create image object for vision api
            response = client.text_detection(image=image)
            
            if response.text_annotations: #list of all text blocks detected
                return response.text_annotations[0].description
            return ""
        except Exception as e:
            return ""
    
    def correct_ocr_errors(self, text):
        words = text.split()
        corrected_words = []
        
        for word in words:
            has_punctuation = ''
            if word and word[-1] in '.,;:!?': #last word has punctuation
                has_punctuation = word[-1]
                word = word[:-1] #remove last character
            
            word_lower = word.lower() #convert to lowercase
            corrected_word = word
            
            if word_lower in self.ocr_corrections:
                corrected_word = self.ocr_corrections[word_lower] #check if the word in the ocr corrections
            elif len(word_lower) <= 4:
                for ocr_error, correction in self.ocr_corrections.items():
                    if len(ocr_error) == len(word_lower): #only compare same length words
                        matches = sum(1 for a, b in zip(ocr_error, word_lower) if a == b) #counts how many letters match exactly at the same position
                        if matches >= len(word_lower) - 1: #only one mistake allowed
                            corrected_word = correction
                            break
            
            corrected_word += has_punctuation
            corrected_words.append(corrected_word)
        
        return ' '.join(corrected_words) #combines all words in the list into a single string
    
    def find_prescription_lines(self, text):
        prescriptions = [] #store final result
        lines = text.split('\n') #split ocr text to lines
        corrected_lines = [self.correct_ocr_errors(line) for line in lines]
        
        for line_num, (original_line, corrected_line) in enumerate(zip(lines, corrected_lines)): #pairs original lines with corrected lines
            line_clean = original_line.strip() #remove extra spaces at start/end
            corrected_clean = corrected_line.strip()
            
            if len(line_clean) < 2: #skip
                continue

            line_lower = corrected_clean.lower()
            skip_indicators = [
                'medical', 'center', 'hospital', 'clinic', 'doctor', 'dr.','patient:', 'name:', 'age:', 'sex:', 'date:', 'reg.', 'no.',
                'tel:', 'fax:', 'email:', 'web:', 'since', 'scanned','mbbs', 'md', 'mrcp', 'mrcs', 'consultant', 'surgeon','bp', 'hb', 'wbc', 'plt', 'fbs', 'tc', 'ldl', 'tg']
            
            if any(indicator in line_lower for indicator in skip_indicators):
                continue #skip non med names and move

            patterns = [
                r'\b(syp|cream|la|tab|cap|inj|drop|ointment|gel|lotion|powder|spray)\.?\s+([A-Z][a-z]{2,})(?:\s+(\d+)\s*([a-z]{1,4}))?\b', #dosage form, drug, dosage, unit
                r'\b([A-Z][a-z]{2,})\s+(\d+)\s*([a-z]{1,4})\s+([a-z\.]{1,6})\s*\/\s*(\d+)\b', #drug, dosage no,dosage unit, frequency,duration
                r'\b([A-Z][a-z]{2,})\s+(\d+)\s*([a-z]{1,4})\s+([a-z\.]{1,6})\b', #drug,dosage no, dosage unit, frequency
                r'\b([A-Z][a-z]{2,})\s+(\d+)\s*([a-z]{1,4})\b', #drug name, dosage no, dosage unit 
                r'\b([A-Z][a-z]{2,})\-(\d+)\b', #drug, dosage
                r'\b([A-Z][a-z]{2,})\s+(\d+)\b', #drug,number
                r'\b([A-Z][a-z]{3,})\b', ]
            
            for pattern in patterns:
                match = re.search(pattern, corrected_clean, re.IGNORECASE) #search anywhere in the line find the 1st match
                if match:
                    drug_word = ""
                    dosage_form = ""
                    dosage = ""
                    
                    #convert shortnmaes to full name and extract the medicine name that use it
                    if len(match.groups()) >= 3 and match.group(1).lower() in self.dosage_form_abbreviations:           #if the pattern found a dosage form like tab or syp at the beginning
                        dosage_form_abbr = match.group(1).lower()                                                       #get the shortname
                        dosage_form = self.dosage_form_abbreviations.get(dosage_form_abbr, dosage_form_abbr)            #if full name didn't found use shortname
                        drug_word = match.group(2)                                                                      #extract medicine

                    #extract dosage number and unit    
                        if len(match.groups()) >= 4 and match.group(3):                                                 # do this pattern have at least 4 captured groups do group 3 exist and contain something 
                            dosage_num = match.group(3)                                                                 #get the dosage no from group 3
                            unit = match.group(4).lower() if len(match.groups()) >= 5 else 'mg' #try to get unit from group 4, but if pattern only has 4 groups total, use mg as default unit
                            if unit in self.ocr_corrections:
                                unit = self.ocr_corrections[unit]
                            dosage = f"{dosage_num}{unit}"
                    else:
                        drug_word = match.group(1)
                        
                        #extract dosage from patterns where drug name comes first, filter non medicine words and very short words
                        if len(match.groups()) >= 3 and match.group(2):                                     
                            dosage_num = match.group(2)
                            unit = match.group(3).lower() if len(match.groups()) >= 4 else 'mg'
                            if unit in self.ocr_corrections:
                                unit = self.ocr_corrections[unit]
                            dosage = f"{dosage_num}{unit}"
                    
                    drug_lower = drug_word.lower()             
                    if drug_lower in self.non_drug_words or len(drug_word) < 3:
                        continue
                    
                    prescriptions.append({
                        'drug_word': drug_word,
                        'line': line_clean, #original full line
                        'dosage_form': dosage_form,
                        'dosage': dosage if dosage else None,
                    })
                    break
        return prescriptions
    
    def search_medicine_by_name_and_dosage(self, drug_name, dosage=None, dosage_form=None):
        drug_lower = drug_name.lower()
        results = []
        
        #extract numerical dosage 
        prescription_dosage_num = None
        if dosage:
            dosage_nums = re.findall(r'\d+\.?\d*', dosage)
            prescription_dosage_num = dosage_nums[0] if dosage_nums else None #take the first number found
        
        for medicine in self.all_medicines:
            brand = medicine.get('brand_name', '').lower()
            generic = medicine.get('generic_name', '').lower()
            db_dosage = medicine.get('Dosage', '').lower() if medicine.get('Dosage') else ''

            brand_similarity = 0
            if brand:
                brand_similarity = SequenceMatcher(None, drug_lower, brand).ratio()

            generic_similarity = 0
            if generic:
                generic_first = generic.split()[0].lower() #take first word
                generic_similarity = SequenceMatcher(None, drug_lower, generic_first).ratio() #compare prescription drug name with first word of generic

            similarity = max(brand_similarity, generic_similarity * 0.9)

            if similarity < 0.3:
                continue
            dosage_match = False
            dosage_score = 1.0
            
            if dosage and db_dosage:
                db_dosage_nums = re.findall(r'\d+\.?\d*', db_dosage) #extract all dosages from database
                db_dosage_num = db_dosage_nums[0] if db_dosage_nums else None
                
                if prescription_dosage_num and db_dosage_num: #take first no found 
                    if prescription_dosage_num == db_dosage_num: #check if numbers match exactly
                        dosage_match = True
                        dosage_score = 1.5
     
                    elif prescription_dosage_num in db_dosage or db_dosage_num in dosage: #prescription number appear anywhere in the DB dosage string
                        dosage_match = True
                        dosage_score = 1.3

                elif dosage.lower() in db_dosage: #500mg 500mg tablets  ull dosage string is found in DB
                    dosage_match = True
                    dosage_score = 1.3
                elif db_dosage and dosage:
                    common_units = ['mg', 'g', 'ml', 'mcg', 'iu', '%']
                    for unit in common_units:
                        if unit in dosage.lower() and unit in db_dosage:
                            dosage_match = True
                            dosage_score = 1.2
                            break

            dosage_form_match = False #check dosage form
            if dosage_form and db_dosage:
                dosage_form_lower = dosage_form.lower()
                if dosage_form_lower in db_dosage:
                    dosage_form_match = True
                    dosage_score *= 1.2
                else:
                    form_synonyms = {
                        'tablet': ['tab', 'tab.', 'tablets', 'tabs'],
                        'capsule': ['cap', 'cap.', 'capsules', 'caps'],
                        'syrup': ['syp', 'syp.', 'syrups'],
                        'injection': ['inj', 'inj.', 'injections', 'injectable'],
                        'cream': ['cr', 'cr.', 'creams'],
                        'ointment': ['oint', 'oint.', 'ointments'],
                    }                 
                    for main_form, synonyms in form_synonyms.items():
                        if dosage_form_lower in synonyms and main_form in db_dosage:
                            dosage_form_match = True
                            dosage_score *= 1.1
                            break
  
            final_similarity = similarity * dosage_score

            match_info = {
                'medicine': medicine,
                'similarity': round(final_similarity, 3),
                'dosage_match': dosage_match, #true/false if dosage matched
                'dosage_form_match': dosage_form_match,
                'brand_similarity': round(brand_similarity, 3),
                'generic_similarity': round(generic_similarity, 3),
                'match_type': 'brand' if brand_similarity > generic_similarity else 'generic',
            }          
            results.append(match_info)

        results.sort(key=lambda x: x['similarity'], reverse=True)#sort results by final similarity score 
        return results[:1]
    
    def get_match_quality(self, similarity):
        if similarity >= 0.8:
            return "Excellent"
        elif similarity >= 0.6:
            return "Good"
        elif similarity >= 0.4:
            return "Fair"
        else:
            return "Poor"
    
    def analyze_prescription(self, text):
        prescriptions = self.find_prescription_lines(text)
        
        all_results = []
        for prescription in prescriptions:
            drug_name = prescription['drug_word']
            dosage = prescription.get('dosage', '')
            dosage_form = prescription.get('dosage_form', '')
            
            matches = self.search_medicine_by_name_and_dosage(drug_name, dosage, dosage_form)
            
            for match in matches:
                med = match['medicine']
                
                result = {
                    'prescription': drug_name,
                    'prescription_dosage': dosage,
                    'prescription_form': dosage_form,
                    'brand': med.get('brand_name'),
                    'generic': med.get('generic_name'),
                    'db_dosage': med.get('Dosage'),
                    'manufacturer': med.get('Manufacturer'),
                    'similarity': match['similarity'],
                    'dosage_match': match['dosage_match'],
                    'dosage_form_match': match['dosage_form_match'],
                    'match_type': match['match_type'],
                    'match_quality': self.get_match_quality(match['similarity']),
                }
                all_results.append(result)
        
        return {
            'raw_text': text[:500] + "..." if len(text) > 500 else text, #first 500 characters of input text
            'prescriptions_found': len(prescriptions),
            'medicines': all_results,
            'summary': {
                'total_matches': len(all_results),
                'brand_matches': sum(1 for r in all_results if r['match_type'] == 'brand'), #count how many results matched by brand namecount how many items in collection satisfy the condition
                'generic_matches': sum(1 for r in all_results if r['match_type'] == 'generic'),
                'dosage_matches': sum(1 for r in all_results if r['dosage_match']),
                'form_matches': sum(1 for r in all_results if r['dosage_form_match']),
            }
        }
analyzer = PrescriptionAnalyzer()

@app.route('/analyze-prescription', methods=['POST']) #flask route handler
def analyze_prescription():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image'] #extracts uploaded file from request
    
    os.makedirs('uploads', exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S') #format date time as string
    file_path = os.path.join('uploads', f"prescription_{timestamp}_{file.filename}") #combine folder and filename
    
    try:
        file.save(file_path)
        text = analyzer.detect_text(file_path)
        
        if not text or len(text.strip()) < 10:
            return jsonify({
                'error': 'Could not extract sufficient text from image',
                'raw_text': text or '',
                'characters': len(text)
            }), 400
        
        analysis_result = analyzer.analyze_prescription(text)
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        return jsonify(analysis_result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True) #ensure runs after file executed