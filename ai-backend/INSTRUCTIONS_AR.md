# دليل تشغيل AI Chat Bot - مساعد الذكاء الاصطناعي

## ملخص المشروع

هذا المشروع يوفر واجهة ويب للدردشة مع نماذج AI مجانية (GPT-4o Mini, Claude 3 Haiku, Mixtral, Llama) بدون الحاجة لمفتاح API.

## الملفات المُنشأة

```
web/
├── index.html    # واجهة الشات الرئيسية
├── style.css     # التصميم والألوان
└── script.js     # منطق التطبيق

launcher.py       # سكربت تشغيل كل شيء تلقائياً
start-chatbot.bat # ملف تشغيل لويندوز
```

---

## 📋 المتطلبات الأساسية

### 1. Python 3.8 أو أحدث

تحقق من التثبيت:
```bash
python --version
```

إذا لم يكن مثبت، حمّله من: https://www.python.org/downloads/

**مهم:** عند التثبيت، اختر "Add Python to PATH"

---

## 🚀 خطوات التشغيل

### الطريقة السهلة (موصى بها):

1. افتح Terminal/CMD في مجلد المشروع:
```
C:\Users\Owner\Downloads\keyless-gpt-wrapper-api-master\keyless-gpt-wrapper-api-master
```

2. شغّل الأمر:
```bash
python launcher.py
```

3. سيفتح المتصفح تلقائياً على: http://localhost:8080

---

### الطريقة اليدوية:

#### الخطوة 1: تثبيت المكتبات
```bash
pip install -r requirements.txt
```

#### الخطوة 2: تشغيل API Server
```bash
python server.py
```
(اتركه يعمل في نافذة منفصلة)

#### الخطوة 3: تشغيل Web Server
افتح نافذة CMD جديدة:
```bash
cd web
python -m http.server 8080
```

#### الخطوة 4: افتح المتصفح
اذهب إلى: http://localhost:8080

---

## 📦 أوامر تثبيت المكتبات (إذا فشل التثبيت التلقائي)

```bash
pip install fastapi
pip install uvicorn
pip install httpx
pip install pydantic
pip install fake-useragent
```

---

## 🎯 النماذج المتاحة

| النموذج | الوصف |
|---------|-------|
| GPT-4o Mini | نموذج OpenAI السريع |
| GPT-o3 Mini | نموذج OpenAI الجديد |
| Claude 3 Haiku | نموذج Anthropic السريع |
| Mixtral 8x7b | نموذج مفتوح المصدر |
| Llama 3.3 70B | نموذج Meta القوي |

---

## ✨ مميزات الواجهة

- ✅ دعم العربية والإنجليزية
- ✅ الوضع الليلي والنهاري
- ✅ تصميم متجاوب للموبايل
- ✅ حفظ سياق المحادثة
- ✅ أزرار سريعة للأسئلة الشائعة
- ✅ مؤشر حالة الاتصال

---

## 🔧 حل المشاكل الشائعة

### مشكلة: "python غير معرّف"
**الحل:** أضف Python إلى PATH أو استخدم `py` بدلاً من `python`

### مشكلة: "تعذر الاتصال بالخادم"
**الحل:** تأكد أن server.py يعمل على port 1337

### مشكلة: "ModuleNotFoundError"
**الحل:** شغّل `pip install -r requirements.txt`

### مشكلة: الصفحة فارغة
**الحل:** افتح Developer Tools (F12) وتحقق من الأخطاء في Console

---

## 📁 هيكل المشروع الكامل

```
keyless-gpt-wrapper-api-master/
├── server.py          # خادم API الرئيسي
├── models.py          # نماذج البيانات
├── config.py          # إعدادات النماذج والأصوات
├── tts.py             # محرك تحويل النص لصوت
├── requirements.txt   # المكتبات المطلوبة
├── launcher.py        # مشغّل تلقائي
├── start-chatbot.bat  # ملف تشغيل ويندوز
└── web/
    ├── index.html     # واجهة المستخدم
    ├── style.css      # التصميم
    └── script.js      # JavaScript
```

---

## 🌐 الروابط المهمة

- **واجهة الشات**: http://localhost:8080
- **API Server**: http://localhost:1337
- **قائمة النماذج**: http://localhost:1337/v1/models

---

## 💡 نصائح الاستخدام

1. **للحصول على أفضل نتائج**: اكتب أسئلة واضحة ومحددة
2. **للمحادثات الطويلة**: استخدم زر "محادثة جديدة" لبدء سياق جديد
3. **للتبديل بين اللغات**: استخدم أزرار اللغة في الشريط الجانبي
4. **للوضع الليلي**: اضغط على أيقونة القمر في الأعلى

---

## 🎉 انتهى!

الآن يمكنك استخدام AI Chat Bot بدون أي تكلفة!

للمساعدة أو الأسئلة، راجع ملف README.md الأصلي.
