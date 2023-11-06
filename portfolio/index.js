const selectedOptions = {};
selectedOptions['selected_skin'] = { currentSelection: document.getElementById('skin_0'), toggleButton: document.getElementById('skin_toggle') };
selectedOptions['selected_mission'] = { currentSelection: document.getElementById('mission_0'), toggleButton: document.getElementById('mission_toggle') };

let selectedMission, missionImageSlider, missionImageSliderMask;
let missionImageCount = 0;

let imageNavButtonPrev, imageNavButtonNext;
let paginationDots;
let selectedImageIndex = 0;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function paginationAdjustAtScrollEnd() {
  const width = missionImageSliderMask.getBoundingClientRect().width;

  // Adding an offset based on number of images to the scroll to get more consistent indices.
  // Otherwise JavaScripts bullshit 'number' math makes the scroll amount a tiny bit less than the width required.
  let index = Math.floor((missionImageSliderMask.scrollLeft + missionImageCount) / width);
  paginationUpdateUI(index);
}

function selectMission(id) {
  // Un-register from scroll event
  if (missionImageSliderMask) {
    missionImageSliderMask.removeEventListener('scrollend', paginationAdjustAtScrollEnd);
  }

  selectedMission = document.getElementById(id);
  missionImageSlider = selectedMission.querySelector('.image_slider');
  missionImageSliderMask = selectedMission.querySelector('.images_mask');

  imageNavButtonPrev = document.querySelector('#image_nav_button_prev');
  imageNavButtonNext = document.querySelector('#image_nav_button_next');

  paginationDots = Array.from(selectedMission.querySelectorAll('.pagination_dot_radio'));
  selectedImageIndex = 0;

  // Only register if there is an image slider
  if (missionImageSliderMask) {
    missionImageSliderMask.addEventListener('scrollend', paginationAdjustAtScrollEnd);
    missionImageCount = missionImageSlider.childElementCount;
  }
}

function paginationUpdateUI(index) {
  if (index <= 0) {
    index = 0;
    imageNavButtonPrev.style.opacity = 0;
    imageNavButtonPrev.style.cursor = 'auto';
    imageNavButtonPrev.tabIndex = "-1";
  } else {
    imageNavButtonPrev.style.opacity = 1;
    imageNavButtonPrev.style.cursor = 'pointer';
    imageNavButtonPrev.tabIndex = "0";
  }
  
  if (index >= missionImageCount - 1) {
    index = missionImageCount - 1;
    imageNavButtonNext.style.opacity = 0;
    imageNavButtonNext.style.cursor = 'auto';
    imageNavButtonNext.tabIndex = "-1";
  } else {
    imageNavButtonNext.style.opacity = 1;
    imageNavButtonNext.style.cursor = 'pointer';
    imageNavButtonNext.tabIndex = "0";
  }

  paginationDots[index].checked = true; // Rest are unchecked automatically
  selectedImageIndex = index;
}

function paginationMoveToIndex(index) {
  const width = missionImageSliderMask.getBoundingClientRect().width;
  missionImageSliderMask.scrollTo(index * width, 0);
}

function onLoad() {
  selectMission('mission_0');

  if (missionImageSlider) {
    paginationMoveToIndex(selectedImageIndex);
  }

  const optionToggles = document.getElementsByClassName('options_list_toggle');
  for (let i = 0; i < optionToggles.length; i++) {
    optionToggles[i].addEventListener('click', function () {
      linkedOptions = document.getElementById(this.value);

      linkedOptions.classList.toggle('mobile_hidden');

      if (linkedOptions.classList.contains('mobile_hidden')) {
        this.innerHTML = 'Select';
      } else {
        this.innerHTML = 'Hide';
      }
    });
  }

  const allOptions = document.getElementsByClassName('option_radio_button');
  for (let i = 0; i < allOptions.length; i++) {
    const linkedPanel = document.getElementById(allOptions[i].value);
    const linkedPanelContainer = linkedPanel.querySelector('.option_info_container');

    if (allOptions[i].checked) {
      linkedPanel.style.transform = "translate(0px)";
      linkedPanel.style.opacity = 1;
      linkedPanelContainer.style.position = 'relative';
      linkedPanel.tabIndex = "0";
    } else {
      linkedPanel.style.transform = "translateX(1000px)";
      linkedPanel.style.opacity = 0;
      linkedPanelContainer.style.position = 'absolute';
      linkedPanel.tabIndex = "-1";
    }

    allOptions[i].addEventListener('click', function() {
      selectedOptions[this.name].toggleButton.click();
    });

    allOptions[i].addEventListener('change', function() {
      const key = this.name;
      let currentOption = selectedOptions[key].currentSelection;
      let currentOptionInfoContainer = currentOption.querySelector('.option_info_container');

      // Hide previous info
      currentOption.style.transform = "translateX(1000px)";
      currentOption.style.opacity = 0;
      currentOptionInfoContainer.style.position = 'absolute';
      currentOption.tabIndex = "-1";

      // Show new info
      currentOption = document.getElementById(this.value);
      currentOption.style.transform = "translate(0px)";
      currentOption.style.opacity = 1;
      currentOption.tabIndex = "0";

      currentOptionInfoContainer = currentOption.querySelector('.option_info_container');
      currentOptionInfoContainer.style.position = 'relative';

      selectedOptions[key].currentSelection = currentOption;
    });
  }

  { // Animate portrait
    const title = document.getElementById('character_title');
    const portrait = document.getElementById('character_portrait');

    title.style.transform = "translateX(0)";
    title.style.opacity = 1;
    title.style.transitionDelay = "0.2s";

    portrait.style.transform = "translateX(0)";
    portrait.style.opacity = 1;
  }

  { // Animate Windows
    const allWindows = document.getElementsByClassName('window');
    const delayMultiplier = 0.13;
    const baseDelay = 0;

    for (let i = 0; i < allWindows.length; i++) {
      allWindows[i].style.transform = "translateY(0)";
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