const selectedOptions = {};
selectedOptions['selected_skin'] = { currentSelection: document.getElementById('skin_0'), toggleButton: document.getElementById('skin_toggle') };
selectedOptions['selected_mission'] = { currentSelection: document.getElementById('mission_0'), toggleButton: document.getElementById('mission_toggle') };

const accentColorNames = [
  'game-developer',
  'film-maker',
  'photographer',
  'programmer'
];

let selectedMission;
let gradientBackground;

let sliderElementCount = 0;
let slider, sliderMask;
let navButtonPrev, navButtonNext;
let paginationDots;
let sliderSelectionIndex = 0;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function paginationAdjustAtScrollEnd() {
  const width = sliderMask.getBoundingClientRect().width;

  // Adding an offset based on number of images to the scroll to get more consistent indices.
  // Otherwise JavaScripts bullshit 'number' math makes the scroll amount a tiny bit less than the width required.
  let index = Math.floor((sliderMask.scrollLeft + sliderElementCount) / width);
  paginationUpdateUI(index);
}

function paginationAdjustAtScrollEndWithAccentColor() {
  const width = sliderMask.getBoundingClientRect().width;

  // Adding an offset based on number of images to the scroll to get more consistent indices.
  // Otherwise JavaScripts bullshit 'number' math makes the scroll amount a tiny bit less than the width required.
  let index = Math.floor((sliderMask.scrollLeft + sliderElementCount) / width);
  gradientBackground.style.opacity = 0;

  setTimeout(() => {
    let root = document.querySelector(':root');
    root.style.setProperty('--accent-light', 'var(--' + accentColorNames[index] + '-light)');
    root.style.setProperty('--accent-dark', 'var(--' + accentColorNames[index] + '-dark)');
    root.style.setProperty('--accent-light-half-opacity', 'var(--' + accentColorNames[index] + '-light-half-opacity)');
    root.style.setProperty('--accent-dark-half-opacity', 'var(--' + accentColorNames[index] + '-dark-half-opacity)');

    gradientBackground.style.opacity = 1;
  }, 200);

  paginationUpdateUI(index);
}

function selectMission(id) {
  // Un-register previous scroll callback
  if (sliderMask) {
    sliderMask.removeEventListener('scrollend', paginationAdjustAtScrollEnd);
  }

  selectedMission = document.getElementById(id);
  slider = selectedMission.querySelector('.slider');

  // Only register if there is an image slider
  if (slider) {
    sliderMask = selectedMission.querySelector('.slider_mask');
    sliderMask.addEventListener('scrollend', paginationAdjustAtScrollEnd);
  
    navButtonPrev = selectedMission.querySelector('#nav_button_prev');
    navButtonNext = selectedMission.querySelector('#nav_button_next');

    sliderElementCount = slider.childElementCount;

    paginationDots = Array.from(selectedMission.querySelectorAll('.pagination_dot_radio'));

    // Firefox doesn't like to scroll anything that's not visible (even though I'm the one telling it to) so it wouldn't update the ui properly. 
    // I guess I'll not move back to the first image every time you switch missions then.
    // I would have liked to move back to the first image but this isn't a bad tradeoff.
    paginationAdjustAtScrollEnd();
  }
}

function paginationUpdateUI(index) {
  if (index <= 0) {
    index = 0;
    navButtonPrev.style.opacity = 0;
    navButtonPrev.style.cursor = 'auto';
    navButtonPrev.tabIndex = "-1";
  } else {
    navButtonPrev.style.opacity = 1;
    navButtonPrev.style.cursor = 'pointer';
    navButtonPrev.tabIndex = "0";
  }
  
  if (index >= sliderElementCount - 1) {
    index = sliderElementCount - 1;
    navButtonNext.style.opacity = 0;
    navButtonNext.style.cursor = 'auto';
    navButtonNext.tabIndex = "-1";
  } else {
    navButtonNext.style.opacity = 1;
    navButtonNext.style.cursor = 'pointer';
    navButtonNext.tabIndex = "0";
  }

  if (paginationDots) {
    paginationDots[index].checked = true; // Rest are unchecked automatically
  }

  sliderSelectionIndex = index;
}

function paginationMoveToIndex(index) {
  const width = sliderMask.getBoundingClientRect().width;
  sliderMask.scrollTo(index * width, 0);
}

function onLoadMissionSelect() {
  selectMission('mission_0');

  const optionToggles = document.getElementsByClassName('options_list_toggle');
  for (let i = 0; i < optionToggles.length; i++) {
    optionToggles[i].addEventListener('click', function () {
      let linkedOptions = document.getElementById(this.value);

      linkedOptions.classList.toggle('mobile_hidden');

      if (linkedOptions.classList.contains('mobile_hidden')) {
        this.querySelector('.option_toggle_arrow').style.transform = 'rotateZ(-90deg)';
      } else {
        this.querySelector('.option_toggle_arrow').style.transform = 'rotateZ(90deg)';
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
      let optionName = document.querySelector('label[for="' + this.id + '"] > span').textContent;

      selectedOptions[this.name].toggleButton.querySelector('h2').textContent = optionName;
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

      // Update mission cache if option has correct tag
      if (currentOption.hasAttribute('data-updates-mission-cache')) {
        selectMission(this.value);
      }

      currentOptionInfoContainer = currentOption.querySelector('.option_info_container');
      currentOptionInfoContainer.style.position = 'relative';

      selectedOptions[key].currentSelection = currentOption;
    });
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

  onLoadPlayTransitions();
}

function onLoadCharacterSelect() {
  // Un-register previous scroll callback
  if (sliderMask) {
    sliderMask.removeEventListener('scrollend', paginationAdjustAtScrollEndWithAccentColor);
  }

  gradientBackground = document.querySelector('.gradient_background');
  slider = document.querySelector('.slider');

  if (slider) {
    sliderMask = document.querySelector('.slider_mask');
    sliderMask.addEventListener('scrollend', paginationAdjustAtScrollEndWithAccentColor);
  
    navButtonPrev = document.querySelector('#nav_button_prev');
    navButtonNext = document.querySelector('#nav_button_next');

    sliderElementCount = slider.childElementCount;

    // Firefox doesn't like to scroll anything that's not visible (even though I'm the one telling it to) so it wouldn't update the ui properly. 
    // I guess I'll not move back to the first image every time you switch missions then.
    // I would have liked to move back to the first image but this isn't a bad tradeoff.
    paginationAdjustAtScrollEndWithAccentColor();
  }

  onLoadPlayTransitions();
}

// Extra functions for pizazz

function onLoadPlayTransitions() {
  { // Animate Horizontal Transitions
    const allHorizontal = document.getElementsByClassName('transition_on_load_horizontal');
    const delayMultiplier = 0.13;
    const baseDelay = 0;
    
    for (let i = 0; i < allHorizontal.length; i++) {
      allHorizontal[i].style.transform = "translateX(0)";
      allHorizontal[i].style.opacity = 1;
      allHorizontal[i].style.transitionDelay = (i * delayMultiplier + baseDelay).toString() + "s";
    }
  }

  { // Animate Vertical Transitions
    const allVertical = document.getElementsByClassName('transition_on_load_vertical');
    const delayMultiplier = 0.13;
    const baseDelay = 0;

    for (let i = 0; i < allVertical.length; i++) {
      allVertical[i].style.transform = "translateY(0)";
      allVertical[i].style.opacity = 1;
      allVertical[i].style.transitionDelay = (i * delayMultiplier + baseDelay).toString() + "s";
    }
  }
}