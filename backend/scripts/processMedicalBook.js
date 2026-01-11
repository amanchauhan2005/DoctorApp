import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import mongoose from 'mongoose';
import connectdb from '../config/mongodb.js';
import ragPipelineService from '../services/ragPipelineService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample Medical Book Content (replace with your actual medical book)
const sampleMedicalBook = `
# Medical Book - Common Conditions and Treatments

## Chapter 1: Infectious Diseases

### Typhoid Fever
Typhoid fever is a bacterial infection caused by Salmonella typhi. It is typically transmitted through contaminated food or water.

Symptoms:
- High fever (often 103-104°F / 39-40°C) that persists
- Vomiting and nausea
- Abdominal pain (mild to severe)
- Diarrhea or loose motions (sometimes constipation)
- Weakness and fatigue
- Headache
- Loss of appetite
- Rose-colored spots on chest/abdomen (in some cases)

Treatment: Antibiotics prescribed by a doctor. Rest, hydration, and proper nutrition are essential. Hospitalization may be required for severe cases.

Prevention: Drink clean water, eat well-cooked food, maintain hygiene, get vaccinated if traveling to high-risk areas.

### Gastroenteritis
Gastroenteritis is inflammation of the stomach and intestines, often caused by viruses, bacteria, or parasites.

Symptoms:
- Vomiting
- Diarrhea or loose motions
- Stomach/abdominal pain or cramps
- Nausea
- Low-grade fever (sometimes)
- Dehydration (if severe)

Treatment: Rest, stay hydrated (oral rehydration solutions), avoid solid foods initially, gradually resume bland diet. Antiemetics and antidiarrheals may be prescribed. Severe cases may need IV fluids.

### Food Poisoning
Food poisoning occurs when you consume contaminated food or water containing harmful bacteria, viruses, or toxins.

Symptoms:
- Sudden onset of vomiting
- Diarrhea or loose motions
- Stomach cramps and pain
- Nausea
- Fever (sometimes)
- Weakness
- Dehydration

Treatment: Rest, hydration (oral rehydration solutions), avoid solid foods initially. Most cases resolve within 24-48 hours. Severe cases may need medical attention.

## Chapter 2: Common Symptoms

### Headache
Headaches can have various causes:
- Tension headaches: Often caused by stress, poor posture, or lack of sleep
- Migraines: Severe headaches with symptoms like nausea, sensitivity to light
- Cluster headaches: Intense pain around one eye
- Sinus headaches: Pain in forehead, cheeks, and nose area

Treatment: Rest in a dark room, stay hydrated, use cold compress, over-the-counter pain relievers. If severe or persistent, consult a healthcare professional.

### Fever
Fever is your body's natural response to infection:
- Normal body temperature: 98.6°F (37°C)
- Low-grade fever: 99-100.4°F (37.2-38°C)
- High fever: Above 101.3°F (38.5°C)

Management: Rest, stay hydrated, use cool compresses, take fever-reducing medication if appropriate. Seek medical attention if fever is very high (above 103°F/39.4°C), persists more than 3 days, or is accompanied by severe symptoms.

### Vomiting
Vomiting can be caused by:
- Infections (stomach flu, food poisoning, typhoid)
- Motion sickness
- Pregnancy
- Medications
- Stress or anxiety
- Serious conditions (appendicitis, meningitis)

Treatment: Stay hydrated with small sips of water, avoid solid foods initially, rest. If persistent, severe, or accompanied by blood, severe pain, or dehydration signs, see a doctor immediately.

### Diarrhea
Diarrhea can be caused by:
- Infections (viral, bacterial, parasitic)
- Food poisoning
- Medications
- Digestive disorders
- Typhoid, gastroenteritis

Treatment: Stay hydrated (oral rehydration solutions), rest, avoid dairy and spicy foods, eat bland foods. If persistent, severe, or accompanied by blood, high fever, or signs of dehydration, consult a doctor.

### Stomach Pain
Stomach pain can indicate:
- Digestive issues (gastroenteritis, food poisoning)
- Infections (typhoid, appendicitis)
- Indigestion
- Serious conditions requiring immediate attention

If stomach pain is severe, persistent, or accompanied by fever, vomiting, diarrhea, or other symptoms, consult a healthcare provider. Emergency care needed for severe sudden pain.
`;

async function processMedicalBook() {
  try {
    console.log('Connecting to MongoDB...');
    await connectdb();
    
    console.log('Processing medical book...');
    
    // Option 1: Use sample medical book
    const result = await ragPipelineService.processMedicalBook(sampleMedicalBook, {
      source: 'medical-book',
      chapter: 'common-conditions',
      section: 'all'
    });
    
    if (result.success) {
      console.log('✅ Medical book processed successfully!');
      console.log(`- Chunks created: ${result.chunksCreated}`);
      console.log(`- Chunks stored: ${result.chunksStored}`);
    } else {
      console.error('❌ Failed to process medical book:', result.error);
    }
    
    // Option 2: Process from file (if you have a medical book file)
    // const bookPath = path.join(__dirname, '../data/medical-book.txt');
    // if (fs.existsSync(bookPath)) {
    //   const bookContent = fs.readFileSync(bookPath, 'utf-8');
    //   const result = await ragPipelineService.processMedicalBook(bookContent, {
    //     source: 'medical-book-file',
    //     chapter: 'all'
    //   });
    //   console.log('Processing result:', result);
    // }
    
    // Get statistics
    const stats = await ragPipelineService.getStatistics();
    console.log('Vector database statistics:', stats);
    
    process.exit(0);
  } catch (error) {
    console.error('Error processing medical book:', error);
    process.exit(1);
  }
}

processMedicalBook();

