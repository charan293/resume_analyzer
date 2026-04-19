// Extract text from PDF
async function extractText(file) {
const reader = new FileReader();

return new Promise((resolve) => {
reader.onload = async function () {
const typedArray = new Uint8Array(this.result);
const pdf = await pdfjsLib.getDocument(typedArray).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    let page = await pdf.getPage(i);
    let content = await page.getTextContent();

    content.items.forEach(item => {
      text += item.str + " ";
    });
  }

  resolve(text);
};

reader.readAsArrayBuffer(file);

});
}

// Stop words (ignore useless words)
const stopWords = ["the", "is", "and", "a", "to", "of", "in", "for", "on", "with"];

// Process text
function processText(text) {
return text
.toLowerCase()
.replace(/[^a-z0-9\s]/g, "")
.split(/\s+/)
.filter(word => word && !stopWords.includes(word));
}

// Analyze function
document.getElementById("analyzeBtn").addEventListener("click", async () => {
const file = document.getElementById("resumeInput").files[0];
const jobDesc = document.getElementById("jobDesc").value;

if (!file || !jobDesc) {
alert("Please upload resume and enter job description");
return;
}

// 🔄 Loading state
document.getElementById("score").innerText = "Analyzing...";
document.getElementById("missing").innerHTML = "";

const resumeText = await extractText(file);

// Remove duplicates
const resumeWords = [...new Set(processText(resumeText))];
const jobWords = [...new Set(processText(jobDesc))];

let matchCount = 0;
let missing = [];

jobWords.forEach(word => {
if (resumeWords.includes(word)) {
matchCount++;
} else {
missing.push(word);
}
});

let score = ((matchCount / jobWords.length) * 100).toFixed(2);

// 🔥 Score feedback
let scoreText = "";

if (score > 75) {
scoreText = "Strong Match ✅";
} else if (score > 50) {
scoreText = "Moderate Match ⚠️";
} else {
scoreText = "Needs Improvement ❌";
}

document.getElementById("score").innerText = score + "% - " + scoreText;

// 📌 Show missing keywords
const missingList = document.getElementById("missing");
missingList.innerHTML = "";

if (missing.length === 0) {
let li = document.createElement("li");
li.innerText = "Great! Your resume matches well 🎉";
li.style.color = "green";
missingList.appendChild(li);
} else {
missing.slice(0, 20).forEach(word => {
let li = document.createElement("li");
li.innerText = word;
li.style.color = "red";
missingList.appendChild(li);
});
}
});
