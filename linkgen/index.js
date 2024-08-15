let linkText, linkLockButton;
let generatedLinkLabel, generateButton;
let sourceSelector, campaignSelector;

function onLoad() {
  generateButton = document.getElementById('generate_button');
  generateButton.readOnly = true;

  linkText = document.getElementById('link_text');
  linkLockButton = document.getElementById('link_text_lock');
  generatedLinkLabel = document.getElementById('generated_link');

  // Get Option References
  sourceSelector = document.getElementById('source');
  sourceSelector.readOnly = true;

  campaignSelector = document.getElementById('campaign');
  campaignSelector.readOnly = true;

  { // Load and setup options
    // const filepath = "https://hritikdutta.github.io/linkgen/options.txt"; // Only for testing offline!
    
    const filepath = document.URL + "options.txt";
    loadFileAsText(filepath, contents => {
      fillOptions(contents);
      campaignSelector.readOnly = sourceSelector.readOnly = generateButton.readOnly = false;
    });
  }
}

function generateLink() {
  let link = linkText.value;
  if (!link) {
    generatedLinkLabel.innerText = "Link can't be empty! What are you making a link for? You dumb!";
    return;
  }

  let isFirstUtmCode = true;
  let generatedLink = link;

  if (sourceSelector.value !== '...') {
    generatedLink = appendUtmCode(generatedLink, isFirstUtmCode, sourceSelector);
    isFirstUtmCode = false;
  }
  
  if (campaignSelector.value !== '...') {
    generatedLink = appendUtmCode(generatedLink, isFirstUtmCode, campaignSelector);
    isFirstUtmCode = false;
  }

  generatedLinkLabel.innerText = generatedLink;
  navigator.clipboard.writeText(generatedLinkLabel.innerText);
}

function appendUtmCode(generatedLink, isFirst, selector) {
  if (isFirst) {
    generatedLink = generatedLink.concat('?');
  }
  else
  {
    generatedLink = generatedLink.concat('&');
  }
  
  return generatedLink.concat('utm_', selector.id, '=', selector.value);
}

function toggleLinkLock() {
  linkText.readOnly = !linkText.readOnly;
  linkLockButton.innerText = linkText.readOnly ? 'Unlock' : 'Lock';
}

function loadFileAsText(filepath, callback) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (request.readyState != 4 || request.status != 200) {
      return;
    }

    // Remove all '\r' cause they just create confusion
    let contents = request.responseText.replace('\r', '');
    callback(contents);
  }

  request.open("GET", filepath, false);
  request.send(null);
}

function fillOptions(contents) {
  let lines = contents.split('\n');

  let currentSelector = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      continue;
    }

    // Check for utm headers
    if (line[0] == '[') {
      if (line[line.length - 1] != ']') {
        console.error(`Error(${i + 1}): UTM Headers must be enclosed between '[' and ']'`);
        continue;
      }

      const header = line.slice(1, -1).toLowerCase();
      let selector = document.getElementById(header);

      if (!selector) {
        console.error(`Error(${i + 1}): UTM Header '${line}' not implemented!`);
        continue;
      }

      currentSelector = selector;
      continue;
    }

    if (!currentSelector) {
      console.error(`Error(${i + 1}): UTM Header not specified before option '${line}'`);
      continue;
    }

    currentSelector.innerHTML = currentSelector.innerHTML.concat(
      `      <option value="${encodeURIComponent(line)}">${line}</option>`
    );
  }
}