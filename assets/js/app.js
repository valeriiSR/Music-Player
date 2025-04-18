import { data } from './data.js';
import { convertToMinAndSec, shuffleArray } from './utils.js';

const AudioController = {
  state: {
    tracks: [],
    currentTrack: {},
    playing: false,
    repeat: false,
    shuffle: false,
    volume: 0.5,
  },

  init() {
    this.initVariables();
    this.initEvents();
    this.renderTrack();
  },

  initVariables() {
    this.audioList = document.getElementById('list');
    this.currentTrackWrapper = document.querySelector('.playback');
    this.playButton = null;
    this.repeatButton = document.querySelector('.repeat');
    this.shuffleButton = document.querySelector('.shuffle');
    this.volumeButton = document.querySelector('.input-volume');
  },

  initEvents() {
    this.audioList.addEventListener('click', this.handleItem.bind(this));
    this.repeatButton.addEventListener('click', this.handleRepeat.bind(this));
    this.shuffleButton.addEventListener('click', this.handleShuffle.bind(this));
    this.volumeButton.addEventListener('change', this.handleVolume.bind(this));
  },

  handleVolume({ target: { value } }) {
    this.state.volume = value;

    const { currentTrack } = this.state;
    if(!currentTrack?.audio) return;

    currentTrack.audio.volume = value;
  },

  handleRepeat() {
    this.repeatButton.classList.toggle('active');
    const { repeat } = this.state;

    this.state.repeat = !repeat;
  },

  handleShuffle() {
    const { children } = this.audioList;
    const shuffeld = shuffleArray([...children]);
    this.audioList.innerHTML = '';
    shuffeld.forEach(item => this.audioList.appendChild(item));
  },

  handleAudioPlay() {
    const { playing, currentTrack } = this.state;
    const { audio } = currentTrack;

    !playing ? audio.play() : audio.pause();
    this.state.playing = !playing;
    
    const icon = this.playButton.querySelector('svg').querySelector('use');
    !playing ? icon.setAttribute('xlink:href','./assets/images/UI/player-icons.svg#pause') : icon.setAttribute('xlink:href','./assets/images/UI/player-icons.svg#play');
  },

  handleAudioPrev() {
    const { currentTrack } = this.state;
    const currentItem = document.querySelector(`[data-id="${currentTrack.id}"]`);
    const prevEl = currentItem.previousElementSibling?.dataset;
    const lastEl = this.audioList.lastElementChild?.dataset;

    const itemId = prevEl?.id || lastEl?.id;
    if(!itemId) return;

    this.setCurrentTrack(itemId);
  },

  handleAudioNext() {
    const { currentTrack } = this.state;
    const currentItem = document.querySelector(`[data-id="${currentTrack.id}"]`);
    const nextEl = currentItem.nextElementSibling?.dataset;
    const firstEl = this.audioList.firstElementChild?.dataset;

    const itemId = nextEl?.id || firstEl?.id;
    if(!itemId) return;

    this.setCurrentTrack(itemId);
  },

  handlePlayer() {
    const play = document.querySelector('.play-button');
    const prev = document.querySelector('.prev-button');
    const next = document.querySelector('.next-button');

    this.playButton = play;
    play.addEventListener('click', this.handleAudioPlay.bind(this));
    prev.addEventListener('click', this.handleAudioPrev.bind(this));
    next.addEventListener('click', this.handleAudioNext.bind(this));
  },

  audioUpdate(audio) {
    const progressInput = document.querySelector('.current-range');
    const timeline = document.querySelector('.timeline-start');
    let progress = 0;
    
    audio.addEventListener('timeupdate', ({ target }) => {
      const { currentTime, duration } = target;
      progress = Math.floor(currentTime * 100 / duration);

      timeline.innerHTML = convertToMinAndSec(currentTime);
      progressInput.value = progress;
    });

    audio.addEventListener('ended', ({ target }) => {
      target.currentTime = 0;

      this.state.repeat ? target.play() : this.handleAudioNext();
    })

    this.handlePlayer();
  },

  renderCurrentTrack() {
    const { audio, group, track, duration, year, link } = this.state.currentTrack;
    const [ image ] = link.split(".");

    const current = `
        <div class="poster">
          <div style="background-image: url('./assets/images/${image}.jpg')" class="current-poster"></div>
        </div>
        <div class="playback__wrapper">
          <div class="current-info">
            <div class="current-info__titles">
              <h2 class="artist__title">${group}</h2>
              <h3 class="sound__title">${track}</h3>
            </div>
            <span class="current-year">${year}</span>
          </div>
          <div class="controls">
            <div class="controls__buttons">
              <div class="prev-button">
                <svg class="controls-icon">
                  <use xlink:href="./assets/images/UI/player-icons.svg#arrow" />
                </svg>
              </div>
              <div class="play-button">
                <svg class="controls-icon controls-icon__play">
                  <use xlink:href="./assets/images/UI/player-icons.svg#play" />
                </svg>
              </div>
              <div class="next-button">
                <svg class="controls-icon">
                  <use xlink:href="./assets/images/UI/player-icons.svg#arrow" />
                </svg>
              </div>
            </div>
            <div class="controls__range">
              <input type="range" min="0" max="100" step="1" value="0" class="current-range" name="duration" id="">
              <div class="duration-info">
                <div class="timeline-start">00:00</div>
                <div class="timeline-end">${convertToMinAndSec(duration)}</div>
              </div>
            </div>
          </div>
        </div>
    `
    
    this.currentTrackWrapper.innerHTML = current;
    this.audioUpdate(audio);
  },

  togglePlaying() {
    const { playing, currentTrack } = this.state;
    const { audio } = currentTrack;

    playing ? audio.play() : audio.pause();

    const icon = this.playButton.querySelector('svg').querySelector('use');
    playing ? icon.setAttribute('xlink:href','./assets/images/UI/player-icons.svg#pause') : icon.setAttribute('xlink:href','./assets/images/UI/player-icons.svg#play');
  },

  pauseCurrentTrack() {
    const { currentTrack: { audio } } = this.state;

    if(!audio) return;
    audio.pause();
    audio.currentTime = 0;
    // this.state.playing = false;
  },

  setCurrentTrack(audioId) {
    const current = this.state.tracks.find(item => +item.id === +audioId);

    if(!current) return;

    this.pauseCurrentTrack();

    this.state.currentTrack = current;
    current.audio.volume = this.state.volume;

    this.renderCurrentTrack();

    setTimeout(() => {
      this.togglePlaying();
    }, 10)
  },

  handleItem({ target }) {
    const { id } = target.dataset;
    if (!id) return;

    this.setCurrentTrack(id);
  },

  loadAudioData(audio) {
    const { id, genre, group, track, duration, link } = audio;
    const [ image ] = link.split(".");

    const trackWrapper = `
      <div class="track-item" data-id="${id}">
        <div class="track-image" style="background-image: url('./assets/images/${image}.jpg')"></div>
        <div class="track-info">
          <p class="track__group-name">${group}</p>
          <p class="track__group-title">${track}</p>
        </div>
        <span class="timeline-current">${convertToMinAndSec(duration)}</span>
        <div class="track-style">${genre}</div>
        <button class="track-play-btn">
          <svg class="controls-icon">
            <use xlink:href="./assets/images/UI/player-icons.svg#play" />
          </svg>
        </button>
      </div>
    `;

    this.audioList.innerHTML += trackWrapper;
  },

  renderTrack() {
    data.forEach(track => {
      const audio = new Audio(`./assets/audio/${track.link}`);
      
      audio.addEventListener('loadeddata', () => {
        const newItem = { ...track, duration: audio.duration, audio }
        this.state.tracks = [ ...this.state.tracks, newItem ];

        this.loadAudioData(newItem);
      })
    })
  },
};




AudioController.init();