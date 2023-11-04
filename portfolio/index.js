const selectedOptions = {};
selectedOptions['selected_skin'] = document.getElementById('skin_0');
selectedOptions['selected_mission'] = document.getElementById('mission_0');

let selectedMission, missionImageSlider;
let imageNavButtonPrev, imageNavButtonNext;
let paginationDots;
let selectedImageIndex = 0;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function paginationMoveToIndex(index) {
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
  
  let lastChildIndex = missionImageSlider.childElementCount - 1;
  if (index >= lastChildIndex) {
    index = lastChildIndex;
    imageNavButtonNext.style.opacity = 0;
    imageNavButtonNext.style.cursor = 'auto';
    imageNavButtonNext.tabIndex = "-1";
  } else {
    imageNavButtonNext.style.opacity = 1;
    imageNavButtonNext.style.cursor = 'pointer';
    imageNavButtonNext.tabIndex = "0";
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

  paginationMoveToIndex(selectedImageIndex);

  const optionToggles = document.getElementsByClassName('options_list_toggle');
  for (let i = 0; i < optionToggles.length; i++) {
    optionToggles[i].addEventListener('click', function () {
      linkedOptions = document.getElementById(this.value);

      linkedOptions.classList.toggle('hidden');

      if (linkedOptions.style.display == 'none') {
        this.innerHTML = 'Hide';
      } else {
        this.innerHTML = 'Select';
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
    } else {
      linkedPanel.style.transform = "translateX(1000px)";
      linkedPanel.style.opacity = 0;
      linkedPanelContainer.style.position = 'absolute';
    }

    allOptions[i].addEventListener('change', function() {
      const key = this.name;
      let currentOption = selectedOptions[key];

      let currentOptionInfoContainer = currentOption.querySelector('.option_info_container');

      // Hide previous info
      currentOption.style.transform = "translateX(1000px)";
      currentOption.style.opacity = 0;
      currentOptionInfoContainer.style.position = 'absolute';

      // Show new info
      currentOption = document.getElementById(this.value);
      currentOption.style.transform = "translate(0px)";
      currentOption.style.opacity = 1;

      currentOptionInfoContainer = currentOption.querySelector('.option_info_container');
      currentOptionInfoContainer.style.position = 'relative';

      const parentToggleID = this.getAttribute('data-parent-toggle');
      document.getElementById(parentToggleID).click();

      selectedOptions[key] = currentOption;
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