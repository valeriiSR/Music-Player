const formatTimeString = (time) => {
  return time < 10 ? `0${time}` : time;
}

export const convertToMinAndSec = (duration) => {
  const minutes = formatTimeString(Math.floor(duration / 60));
  const seconds = formatTimeString(Math.floor(duration - minutes * 60));

  return `${minutes}:${seconds}`;
}

export const shuffleArray = (array) => array.sort(() => 0.5 - Math.random());