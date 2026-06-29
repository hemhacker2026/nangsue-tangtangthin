/**
 * ============================================================
 * config.js
 * ไฟล์ตั้งค่าการเชื่อมต่อกับ Google Sheets
 * ============================================================
 * 
 * วิธีการใช้งาน:
 * 1. เปิด Google Sheets ที่มีข้อมูลหนังสือ
 * 2. ไปที่ File > Share > เปลี่ยนเป็น "Anyone with the link" > Viewer
 * 3. คัดลอก Spreadsheet ID จาก URL
 * 4. วางในตัวแปร SPREADSHEET_ID ด้านล่าง
 * ============================================================
 */

// ============================================================
// 🔑 ตั้งค่าการเชื่อมต่อ Google Sheets
// ============================================================

/** 
 * รหัส Spreadsheet (ได้จาก URL ของ Google Sheets)
 * ตัวอย่าง URL: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F.../edit
 * ให้เอาส่วน 1A2B3C4D5E6F... มาใส่ตรงนี้
 */
const SPREADSHEET_ID = '1LGVOEEg2dkbMADeJk4v6O6ToWpc9utPz1mpMceceA5Q';

/** 
 * ชื่อ Sheet ที่ใช้เก็บข้อมูล (ถ้าไม่เปลี่ยนชื่อจะใช้ Sheet1)
 */
const SHEET_NAME = 'Sheet1';

/** 
 * URL สำหรับดึงข้อมูลจาก Google Sheets แบบ JSON
 * ใช้ gviz API ของ Google เพื่อแปลงข้อมูลเป็น JSON
 */
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

// ============================================================
// 📚 ข้อมูลสำรอง (ใช้กรณีเชื่อมต่อ Google Sheets ไม่ได้)
// ============================================================

const SAMPLE_BOOKS = [
    {
        book_id: 'AK-001',
        title: 'อัลอุศูล อัษษะลาษะฮ์',
        author: 'มุฮัมมัด บิน อับดุลวะฮาบ',
        category: 'อะกีดะฮ์',
        level: 'เริ่มต้น',
        price: 120,
        description: 'หนังสืออธิบายหลักศรัทธาพื้นฐาน 3 ประการของอิสลาม เนื้อหาเข้าใจง่าย เหมาะสำหรับผู้เริ่มต้น',
        table_of_contents: 'บทที่ 1: รู้จักอัลลอฮ์\nบทที่ 2: รู้จักอิสลาม\nบทที่ 3: รู้จักนบีมุฮัมมัด',
        cover_image: '',
        book_code: 'AK-001',
        sales_count: 45,
        search_count: 120,
        is_featured: 'TRUE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'FK-001',
        title: 'คู่มือมุสลิมใหม่',
        author: 'คณะผู้เรียบเรียง',
        category: 'ฟิกฮ์',
        level: 'เริ่มต้น',
        price: 90,
        description: 'คู่มือสำหรับผู้เริ่มต้นปฏิบัติศาสนกิจ ครอบคลุมการอาบน้ำละหมาด การถือศีลอด และซะกาต',
        table_of_contents: 'บทที่ 1: การทำวุฎู\nบทที่ 2: การละหมาด\nบทที่ 3: การถือศีลอด',
        cover_image: '',
        book_code: 'FK-001',
        sales_count: 78,
        search_count: 95,
        is_featured: 'TRUE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'HD-001',
        title: 'อัลอัรบะอูน อันนะวะวียะฮ์ (40 หะดีษ)',
        author: 'อิมาม อันนะวาวี',
        category: 'หะดีษ',
        level: 'เริ่มต้น',
        price: 110,
        description: 'รวม 40 หะดีษที่สำคัญที่สุดในอิสลาม พร้อมคำอธิบายเข้าใจง่าย เหมาะกับทุกวัย',
        table_of_contents: 'หะดีษที่ 1: อัลอะม้าล บินนียาต\nหะดีษที่ 2: อัลอีมาน\n... ถึงหะดีษที่ 40',
        cover_image: '',
        book_code: 'HD-001',
        sales_count: 156,
        search_count: 210,
        is_featured: 'TRUE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'TF-001',
        title: 'ตัฟซีร อัลมุยัซซัร',
        author: 'คณะนักวิชาการ',
        category: 'ตัฟซีร',
        level: 'เริ่มต้น',
        price: 150,
        description: 'อรรถกถาอัลกุรอานฉบับเข้าใจง่าย ภาษาไม่ซับซ้อน เหมาะกับผู้เริ่มต้นศึกษาตัฟซีร',
        table_of_contents: 'ซูเราะฮ์ อัลฟาติฮะฮ์\nซูเราะฮ์ อัลบะเกาะเราะฮ์',
        cover_image: '',
        book_code: 'TF-001',
        sales_count: 34,
        search_count: 67,
        is_featured: 'FALSE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'LA-001',
        title: 'อัลอัจญ์รูมียะฮ์',
        author: 'อิบนุ อัจญ์รูม',
        category: 'ภาษา',
        level: 'เริ่มต้น',
        price: 80,
        description: 'หนังสือไวยากรณ์ภาษาอาหรับพื้นฐาน เรียนรู้โครงสร้างประโยคและการผันคำเบื้องต้น',
        table_of_contents: 'บทที่ 1: อัลกะลาม\nบทที่ 2: อัลฟิอิล\nบทที่ 3: อัลฮุรูฟ',
        cover_image: '',
        book_code: 'LA-001',
        sales_count: 92,
        search_count: 130,
        is_featured: 'FALSE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'SR-001',
        title: 'อัรรอฮิก อัลมัคตูม (ฉบับย่อ)',
        author: 'ซัยฟุรเราะห์มาน อัลมุบาร็อกฟูรี',
        category: 'ซีเราะฮ์',
        level: 'ปานกลาง',
        price: 180,
        description: 'ประวัติศาสดามุฮัมมัดฉบับสมบูรณ์ เรียบเรียงจากหลักฐานที่เชื่อถือได้ ระดับปานกลาง',
        table_of_contents: 'บทที่ 1: ก่อนรับศาสนทูต\nบทที่ 2: ยุคเมกกะฮ์\nบทที่ 3: ยุคมะดีนะฮ์',
        cover_image: '',
        book_code: 'SR-001',
        sales_count: 67,
        search_count: 89,
        is_featured: 'TRUE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    },
    {
        book_id: 'OT-001',
        title: 'อัลฮิกัม (คำคมของอิบนุ อะฏออิลลาฮ์)',
        author: 'อิบนุ อะฏออิลลาฮ์ อัสสักันดะรี',
        category: 'อื่นๆ',
        level: 'ปานกลาง',
        price: 130,
        description: 'รวมคำคมและบทเรียนจิตวิญญาณ เน้นการทำจิตใจให้บริสุทธิ์และใกล้ชิดอัลลอฮ์',
        table_of_contents: 'ว่าด้วยความจริงใจ\nว่าด้วยความหวัง\nว่าด้วยการละทิ้งโลก',
        cover_image: '',
        book_code: 'OT-001',
        sales_count: 43,
        search_count: 55,
        is_featured: 'FALSE',
        facebook_link: 'https://m.me/ชื่อเพจ'
    }
];
