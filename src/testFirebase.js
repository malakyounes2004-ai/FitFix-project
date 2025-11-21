import { auth, db } from "./firebase.js";

async function test() {
  try {
    // اختبار قراءة وكتابة
    const docRef = db.collection("test").doc("hello");
    await docRef.set({ message: "Firebase Connected ✅" });
    const doc = await docRef.get();
    console.log(doc.data());
  } catch (err) {
    console.error("Firebase error:", err);
  }
}

test();
