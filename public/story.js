function formatDate (time) {
	var result = ''
	if (time === 0) {
		result = '0/0/0 - The start of time.';
	} else {
		var date = new Date(time);
		var h = date.getHours();
		var m = date.getMinutes();
		if (m < 10) m = '0' + m;
		if (h == 12) h = h + ':' + m + 'pm';
		else if (h > 12) h = (h - 12) + ':' + m + 'pm';
		else h = h + ':' + m + 'am';
		result = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' - ' + h;
	}
	return result;
}

function Story (x, y, storyText, time) {
	this.pos = createVector(x, y);
	this.text = storyText;
	this.time = formatDate(time);

	this.show = function() {
		if ((abs(xOff - this.pos.x) < 1.4) && (abs(yOff - this.pos.y) < 1.4)) {
			fill(storyPinColor.x, storyPinColor.y, storyPinColor.z);

			var distX = xOff - this.pos.x;
			var distY = yOff - this.pos.y;

			fill(storyTextColor.x, storyTextColor.y, storyTextColor.z);
			textFont(storyFont);
			textSize(fontScale);
			textAlign(CENTER, CENTER);

			push();
				translate(-distY * 45, -storyHeight, -distX * 45);

				push();
					translate(0, -storyHeight * 3, 0);
					rotate(radians(-camRotationLeft), createVector(0, 1, 0));
					rotate(radians(-camRotationUp), createVector(1, 0, 0));
					text(this.text + "\n\n" + this.time, 0, 0);
				pop();

				rotate(radians(0), createVector(1, 0, 0));
				cone(storyScale, storyScale * 2.5);
			pop();
		}
	}
}