function User (config) {
	this.id = config.id
	this.pos = createVector(config.x, config.y);
	this.self = this.id === socket.id
	this.text = this.self ? 'you' : 'player ' + this.id.slice(0, 6)
	this.color = this.self ? selfPinColor : userPinColor
}

User.prototype.show = function() {
	if (
		(abs(xOff - this.pos.x) < 1.4) &&
		(abs(yOff - this.pos.y) < 1.4)
	) {
		fill(this.color.x, this.color.y, this.color.z);

		var distX = xOff - this.pos.x;
		var distY = yOff - this.pos.y;

		fill(this.color.x, this.color.y, this.color.z);
		textFont(storyFont);
		textSize(fontScale);
		textAlign(CENTER, CENTER);

		push();
		translate(-distY * 45, -storyHeight, -distX * 45);

		push();
		translate(0, -storyHeight * 3, 0);
		rotate(radians(-camRotationLeft), createVector(0, 1, 0));
		rotate(radians(-camRotationUp), createVector(1, 0, 0));
		text('\n\n\n\n' + this.text, 0, 0);
		pop();

		rotate(radians(0), createVector(1, 0, 0));
		cone(storyScale, storyScale * 2.5);
		pop();
	}
}
