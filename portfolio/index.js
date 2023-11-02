const allSkinOptions = document.getElementsByClassName('skin_radio_button');

let selectedMission, missionImageSlider;
let imageNavButtonPrev, imageNavButtonNext;
let paginationDots;
let selectedImageIndex = 0;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function handleRadioClick(optionList) {
  for (let i = 0; i < optionList.length; i++) {
    const skinVisualID = optionList[i].value;
    const element = document.getElementById(skinVisualID);

    if (optionList[i].checked) {
      element.style.transform = "translateX(0px)";
      element.style.opacity = 1;
    } else {
      element.style.transform = "translateX(30px)";
      element.style.opacity = 0;
    }
  }
}

function paginationMoveToIndex(index) {
  if (index <= 0) {
    index = 0;
    imageNavButtonPrev.style.opacity = 0;
    imageNavButtonPrev.style.cursor = 'auto';
  } else {
    imageNavButtonPrev.style.opacity = 1;
    imageNavButtonPrev.style.cursor = 'pointer';
  }
  
  let lastChildIndex = missionImageSlider.childElementCount - 1;
  if (index >= lastChildIndex) {
    index = lastChildIndex;
    imageNavButtonNext.style.opacity = 0;
    imageNavButtonNext.style.cursor = 'auto';
  } else {
    imageNavButtonNext.style.opacity = 1;
    imageNavButtonNext.style.cursor = 'pointer';
  }

  paginationDots[index].checked = true; // Rest are unchecked automatically

  missionImageSlider.style.transform = "translate(" + (-index * 100).toString() + "%)";
  selectedImageIndex = index;
}

function onLoad() {

  // All of this needs to be done when a new mission is selected
  selectedMission = document.getElementById('mission_0');
  missionImageSlider = selectedMission.querySelector('.image_slider');

  imageNavButtonPrev = document.querySelector('#image_nav_button_prev');
  imageNavButtonNext = document.querySelector('#image_nav_button_next');

  paginationDots = Array.from(selectedMission.querySelectorAll('.pagination_dot_radio'));
  selectedImageIndex = 0;

  handleRadioClick(allSkinOptions);
  paginationMoveToIndex(selectedImageIndex);

  { // Animate Windows
    const allWindows = document.getElementsByClassName('window');
    const delayMultiplier = 0.13;
    const baseDelay = 0;

    for (let i = 0; i < allWindows.length; i++) {
      allWindows[i].style.transform = "translateY(0px)";
      allWindows[i].style.opacity = 1;
      allWindows[i].style.transitionDelay = (i * delayMultiplier + baseDelay).toString() + "s";
    }
  }

  { // Animate Skill Bars
    const allSkillBars = document.getElementsByClassName('skill_point_bar');
    const delayMultiplier = 0.1;
    const baseDelay = .26;

    for (let i = 0; i < allSkillBars.length; i++) {
      allSkillBars[i].style.setProperty('--_width', allSkillBars[i].getAttribute('value'));
      allSkillBars[i].style.setProperty('--_transitionDelay', (i * delayMultiplier + baseDelay).toString() + 's');
    }
  }
}