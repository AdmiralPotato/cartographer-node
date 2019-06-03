function User (config) {
	this.id = config.id
	this.pos = createVector(config.x, config.y);
	this.hue = config.hue
	this.self = this.id === socket.id
}

User.prototype.show = function() {
	if (
		!this.self &&
		(abs(this.pos.x) + abs(this.pos.y)) !== 0 && // don't show other players that haven't moved off 0,0
		(abs(xOff - this.pos.x) < 1.4) &&
		(abs(yOff - this.pos.y) < 1.4)
	) {
		var distX = xOff - this.pos.x;
		var distY = yOff - this.pos.y;

		push();
		translate(-distY * 45, -storyHeight, -distX * 45);
		colorMode(HSB, 1);
		fill(this.hue, 0.5, 1);
		textFont(storyFont);
		textSize(fontScale);
		textAlign(CENTER, CENTER);
		rotate(radians(-camRotationLeft), createVector(0, 1, 0));
		rotate(radians(-camRotationUp), createVector(1, 0, 0));
		torus(storyScale * 1.5, storyScale * 0.5, 4, 4);
		translate(0, -storyHeight * 3, 0);
		text('\n\n\n\nplayer', 0, 0);
		pop();
	}
}
