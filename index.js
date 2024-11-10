const selectedOptions = {};

let selectedMission;
let selectedVideo, selectedVideoMuteIcon, selectedVideoUnmuteIcon;
let isSelectedVideoVisible;
let selectedVideoHasAudio;
let gradientBackground;

let sliderElements;
let slider, sliderMask;
let navButtonPrev, navButtonNext;
let sliderDots;
let sliderCurrentSelectionIndex = -1;
let sliderTargetSelectionIndex  = 0;

let forcedScrolling = false;

function togglePlayStateOfVideo(video, shouldPlay) {
  if (shouldPlay)
    video.play();
  else
    video.pause();
}

function toggleVideoPlayBasedOnVisibility() {
  if (selectedVideo) {
    togglePlayStateOfVideo(selectedVideo, isSelectedVideoVisible && !document.hidden);
  }
}

const videoIntersectionObserver = new IntersectionObserver(function (items) {
  items.forEach(function (item) {
    togglePlayStateOfVideo(item.target, item.isIntersecting);
    isSelectedVideoVisible = item.isIntersecting;
  });
});

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function sliderAdjustDuringScroll() {
  forcedScrolling = true;

  const width = sliderMask.getBoundingClientRect().width;
  let index = Math.floor((sliderMask.scrollLeft / width) + 0.5);

  if (sliderCurrentSelectionIndex !== index) {
    sliderUpdateUI(index);
  }
}

function sliderAdjustAtScrollEnd() {
  const width = sliderMask.getBoundingClientRect().width;
  sliderTargetSelectionIndex = Math.floor((sliderMask.scrollLeft / width) + 0.5);
  forcedScrolling = false;

  setTimeout(function() {
    // Custom scroll snapping to ensure it works on all browsers consistently
    if (!forcedScrolling && Math.abs((sliderMask.scrollLeft / width) - sliderTargetSelectionIndex) >= 0.01) {
      sliderMask.scrollTo(sliderTargetSelectionIndex * width, 0);
    }
  }, 50);
}

function toggleMute() {
  if (selectedVideo) {
    selectedVideo.muted = !selectedVideo.muted;
  }
}

function toggleMuteIcons() {
  selectedVideoMuteIcon.style.display   = selectedVideo.muted ? 'block' : 'none';
  selectedVideoUnmuteIcon.style.display = selectedVideo.muted ? 'none' : 'block';
}

function selectMission(id) {
  // Un-register previous scroll callback
  if (sliderMask) {
    sliderMask.removeEventListener('scroll', sliderAdjustDuringScroll);
    sliderMask.removeEventListener('scrollend', sliderAdjustAtScrollEnd);
  }
  
  selectedMission = document.getElementById(id);
  slider = selectedMission.querySelector('.slider');

  selectedOptions['selected_mission'] = { currentSelection: selectedMission, toggleButton: document.getElementById('mission_toggle') };

  forcedScrolling = false;

  // Only register if there is an image slider
  if (slider) {
    sliderMask = selectedMission.querySelector('.slider_mask');
    sliderMask.addEventListener('scroll', sliderAdjustDuringScroll);
    sliderMask.addEventListener('scrollend', sliderAdjustAtScrollEnd);
    
    navButtonPrev = selectedMission.querySelector('#nav_button_prev');
    navButtonNext = selectedMission.querySelector('#nav_button_next');
    
    sliderElements = slider.children;
    
    sliderDots = Array.from(selectedMission.querySelectorAll('.slider_dot_radio'));
    sliderCurrentSelectionIndex = -1;
    
    const width = sliderMask.getBoundingClientRect().width;
    sliderTargetSelectionIndex = Math.floor((sliderMask.scrollLeft / width) + 0.5);
    sliderAdjustDuringScroll();
  }
}

function sliderUpdateUI(index) {
  if (index <= 0) {
    index = 0;
    navButtonPrev.style.opacity = 0;
    navButtonPrev.style.cursor = 'auto';
    navButtonPrev.style.pointerEvents = 'none';
    navButtonPrev.tabIndex = "-1";
  } else {
    navButtonPrev.style.opacity = 1;
    navButtonPrev.style.cursor = 'pointer';
    navButtonPrev.style.pointerEvents = 'auto';
    navButtonPrev.tabIndex = "0";
  }
  
  if (index >= sliderElements.length - 1) {
    index = sliderElements.length - 1;
    navButtonNext.style.opacity = 0;
    navButtonNext.style.cursor = 'auto';
    navButtonNext.style.pointerEvents = 'none';
    navButtonNext.tabIndex = "-1";
  } else {
    navButtonNext.style.opacity = 1;
    navButtonNext.style.cursor = 'pointer';
    navButtonNext.style.pointerEvents = 'auto';
    navButtonNext.tabIndex = "0";
  }
  
  sliderDots[index].checked = true; // Rest are unchecked automatically
  sliderCurrentSelectionIndex = index;

  // Mute previous video
  if (selectedVideo) {
    videoIntersectionObserver.unobserve(selectedVideo);

    // Can't pause if it's not loaded
    if (selectedVideo.readyState === 4) {
      selectedVideo.pause();
    }

    if (selectedVideoHasAudio) {
      selectedVideo.removeEventListener('volumechange', toggleMuteIcons);
    }

    document.removeEventListener('visibilitychange', toggleVideoPlayBasedOnVisibility);

    // Just to be safe
    selectedVideoMuteIcon = null;
    selectedVideoUnmuteIcon = null;
    selectedVideoHasAudio = false;
  }

  selectedVideo = sliderElements[index].querySelector('video');

  if (selectedVideo) {
    videoIntersectionObserver.observe(selectedVideo);
    
    selectedVideoMuteIcon   = sliderElements[index].querySelector('.mute_icon');
    selectedVideoUnmuteIcon = sliderElements[index].querySelector('.unmute_icon');

    document.addEventListener('visibilitychange', toggleVideoPlayBasedOnVisibility);

    // Mute/Unmute button are omitted if the video doesn't have any audio
    selectedVideoHasAudio = selectedVideoMuteIcon && selectedVideoUnmuteIcon;
    if (selectedVideoHasAudio) {
      selectedVideo.addEventListener('volumechange', toggleMuteIcons);
    }
  }
}

function sliderMoveToIndex(index) {
  const width = sliderMask.getBoundingClientRect().width;
  sliderTargetSelectionIndex = clamp(index, 0, sliderElements.length - 1);

  // Unchecking the selected dot because scrolling would eventually land on it and
  // check it anyways. Otherwise it was creating conflicts when movign using the dots.
  sliderDots[sliderTargetSelectionIndex].checked = false;
  
  sliderMask.scrollTo(sliderTargetSelectionIndex * width, 0);
}

function onLoadMissionSelect() {
  selectedOptions['selected_skin'] = { currentSelection: document.getElementById('skin_0'), toggleButton: document.getElementById('skin_toggle') };
  
  selectMission(missionIDToSelectOnLoad);
  
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

  { // Register events for poster images or other elements in videos
    const allVideos = document.querySelectorAll('video');
    for (let i = 0; i < allVideos.length; i++) {
      allVideos[i].addEventListener('canplay', function() {
        if (this != selectedVideo)
          this.pause();

        let elements = this.parentElement.querySelectorAll('.disappear_on_video_load');
        if (elements) {
          for (let j = 0; j < elements.length; j++) {
            elements[j].style.display = 'none';
          }
        }
      });
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
  
  onLoadPlayTransitions();
}

function changeBackgroundGradientColor(index) {
  if (gradientBackground.style.opacity >= 1)
    gradientBackground.style.opacity = 0;
  
  setTimeout(() => {
    let root = document.querySelector(':root');
    root.style.setProperty('--accent-light', 'var(--' + accentColorNames[index] + '-light)');
    root.style.setProperty('--accent-dark', 'var(--' + accentColorNames[index] + '-dark)');
    root.style.setProperty('--accent-light-half-opacity', 'var(--' + accentColorNames[index] + '-light-half-opacity)');
    root.style.setProperty('--accent-dark-half-opacity', 'var(--' + accentColorNames[index] + '-dark-half-opacity)');
    
    gradientBackground.style.opacity = 1;
  }, 200);
}

function sliderAdjustDuringScrollWithAccentColor() {
  forcedScrolling = true;

  const width = sliderMask.getBoundingClientRect().width;
  let index = Math.floor((sliderMask.scrollLeft / width) + 0.5);
  
  if (index != sliderCurrentSelectionIndex) {
    changeBackgroundGradientColor(index);
    sliderUpdateUI(index);
  }
}

function onLoadCharacterSelect() {
  // TODO: When the character panel goes outside the view, it should not be
  // accessible by tabs.

  // TODO: Try using intersection observer to add interesting effects to slider

  // Un-register previous scroll callback
  if (sliderMask) {
    sliderMask.removeEventListener('scroll', sliderAdjustDuringScrollWithAccentColor);
    sliderMask.removeEventListener('scrollend', sliderAdjustAtScrollEnd);
  }
  
  gradientBackground = document.querySelector('.gradient_background');
  slider = document.querySelector('.slider');
  
  forcedScrolling = false;
  
  if (slider) {
    sliderMask = document.querySelector('.slider_mask');
    sliderMask.addEventListener('scroll', sliderAdjustDuringScrollWithAccentColor);
    sliderMask.addEventListener('scrollend', sliderAdjustAtScrollEnd);
    
    navButtonPrev = document.querySelector('#nav_button_prev');
    navButtonNext = document.querySelector('#nav_button_next');
    
    sliderElements = slider.children;

    sliderDots = Array.from(document.querySelectorAll('.slider_dot_radio'));
    sliderCurrentSelectionIndex = -1; // Just to be safe
    
    const width = sliderMask.getBoundingClientRect().width;
    sliderTargetSelectionIndex = Math.floor((sliderMask.scrollLeft / width) + 0.5);
    sliderAdjustDuringScrollWithAccentColor();
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

function onLoadLinks() {
  gradientBackground = document.querySelector('.gradient_background');

  const changeInterval = 1000
  let totalDuration = accentColorNames.length * changeInterval

  for (let i = 0; i < accentColorNames.length; i++) {
      setTimeout(() => {
        
        setInterval(() => {
          changeBackgroundGradientColor(i);
        }, totalDuration);

      }, i * changeInterval);
  }

  onLoadPlayTransitions();
}