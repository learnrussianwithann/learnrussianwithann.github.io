function toggleFullscreen() {
	if (document.fullscreenElement) {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) { /* Safari */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) { /* IE11 */
			document.msExitFullscreen();
		}
		img_fullscreen.style.display = 'block';
		img_exit_fullscreen.style.display = 'none';
		screen.orientation.lock('any');
	} else {
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		} else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
			document.documentElement.webkitRequestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) { /* IE11 */
			document.documentElement.msRequestFullscreen();
		}
		img_fullscreen.style.display = 'none';
		img_exit_fullscreen.style.display = 'block';
		screen.orientation.lock('landscape');
	}
}

const img_fullscreen = new Image(100, 100);
img_fullscreen.src = '../img/fullscreen.png';
img_fullscreen.style = 'z-index: 1000; position: absolute; right: 3vmax; bottom: 3vmax; opacity: .5; width: 5vmax; height: 5vmax; display: block; user-select: none; -webkit-touch-callout: none; -webkit-user-select: none;';
img_fullscreen.onclick = toggleFullscreen;

const img_exit_fullscreen = new Image(100, 100);
img_exit_fullscreen.src = '../img/exit_fullscreen.png';
img_exit_fullscreen.style = 'z-index: 1000; position: absolute; right: 3vmax; bottom: 3vmax; opacity: .5; width: 5vmax; height: 5vmax; display: none; user-select: none; -webkit-touch-callout: none; -webkit-user-select: none;';
img_exit_fullscreen.onclick = toggleFullscreen;

document.body.append(img_fullscreen);
document.body.append(img_exit_fullscreen);