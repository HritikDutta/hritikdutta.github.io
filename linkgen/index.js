let linkText, linkLockButton;
let generatedLinkLabel;
let sourceSelector, campaignSelector;

function onLoad() {
  linkText = document.getElementById('link_text');
  linkLockButton = document.getElementById('link_text_lock');
  generatedLinkLabel = document.getElementById('generated_link');

  // Get Option References
  sourceSelector = document.getElementById('source');
  campaignSelector = document.getElementById('campaign');
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
  
  return generatedLink.concat('utm_', selector.id, '=', encodeURIComponent(selector.value));
}

function toggleLinkLock() {
  linkText.readOnly = !linkText.readOnly;
  linkLockButton.innerText = linkText.readOnly ? 'Unlock' : 'Lock';
}