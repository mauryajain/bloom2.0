import { GoogleGenerativeAI } from '@google/generative-ai';

const key = "AIzaSyCBqMXVfFtBOhu7yWrmJUEHSAHJh6jk4nM";

async function test() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
    const data = await response.json();
    console.log("Models:", data.models?.map(m => m.name).join(", ") || data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
