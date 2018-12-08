$(document).ready(function () {
	var canvas = $("#gameCanvas");
	var context = canvas.get(0).getContext("2d");
	// Canvas dimensions

	var { playerOriginalX, player, playerOriginalY, playGame, 
		platformX, canvasWidth, platformY, canvasHeight, 
		platformOuterRadius, platformInnerRadius, 
		balls, playerSelected, playerMaxAbsVelocity, 
		playerVelocityDampener, 
		powerX, powerY, score } = declarations(canvas);

	//var ui = $("#gameUI");
	var { uiScore, uiStats, uiRemaining, uiComplete, uiPlay, 
		uiIntro, uiReset } = declarationsUi();
	// Reset and start the game
	uiScore.html("0");
	uiStats.show();
	class Ball {
		constructor(x, y, radius, mass, friction) {
			this.constructorArgs(x, y, radius, mass, friction);
		}

		constructorArgs(x, y, radius, mass, friction) {
			this.x = x;
			this.y = y;
			this.radius = radius;
			this.mass = mass;
			this.friction = friction;
			this.vX = 0;
			this.vY = 0;
			this.player = false;
			this.black = false;
			this.playerColorA = false;
			this.playerColorB = false;
		}
	}

	function resetPlayer() {
		playerOriginalX = player.x;
		playerOriginalY = player.y
		player.x = playerOriginalX;
		player.y = playerOriginalY;
		player.vX = 0;
		player.vY = 0;
	};
	function startGame() {
		// Set up initial game settings
		playGame = true;
		platformX = canvasWidth / 4;
		platformY = canvasHeight / 2;
		platformOuterRadius = 100;
		platformInnerRadius = 75;
		balls = new Array();
		playerSelected = false;
		playerMaxAbsVelocity = 30;
		playerVelocityDampener = 0.3;
		powerX = -1;
		powerY = -1;
		score = 0;
		var pRadius = 13;
		var pMass = 10;
		var pFriction = 0.98;
		playerOriginalX = canvasWidth - 100;
		playerOriginalY = canvasHeight / 2;
		player = new Ball(playerOriginalX, playerOriginalY, pRadius, pMass, pFriction);
		player.player = true;
		balls.push(player);
		var outerRing = 8; // Balls around outer ring
		var ringCount = 3; // Number of rings
		var ringSpacing = (platformInnerRadius / (ringCount - 1)); // Distance between each ring

		var { x, y } = ringMaker(ringCount, outerRing, platformInnerRadius, ringSpacing, platformX, platformY, Ball, balls);

		var bMass = 8;
		var bRadius = 11
		var black = new Ball(x, y, bRadius, bMass, 0.95);
		black.black = true;
		balls.push(black)
		uiRemaining.html(balls.length - 1);
		// Start the animation loop
		$(window).mousedown(function (e) {
			if (!playerSelected && player.x == playerOriginalX && player.y == playerOriginalY) {
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX - canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);
				if (!playGame) {
					playGame = true;
					animate();
				};

				var dX = player.x - canvasX;
				var dY = player.y - canvasY;
				var distance = Math.sqrt((dX * dX) + (dY * dY));
				var padding = 5;
				if (distance < player.radius + padding) {
					powerX = player.x;
					powerY = player.y;
					playerSelected = true;
				};
			};
		});
		$(window).mousemove(function (e) {
			if (playerSelected) {
				var canvasOffset = canvas.offset();
				var canvasX = Math.floor(e.pageX - canvasOffset.left);
				var canvasY = Math.floor(e.pageY - canvasOffset.top);
				var dX = canvasX - player.x;
				var dY = canvasY - player.y;
				var distance = Math.sqrt((dX * dX) + (dY * dY));
				if (distance * playerVelocityDampener < playerMaxAbsVelocity) {
					powerX = canvasX;
					powerY = canvasY;
				} else {
					var ratio = playerMaxAbsVelocity / (distance * playerVelocityDampener) * 2;
					powerX = player.x + (dX * ratio);
					powerY = player.y + (dY * ratio);
				};
			};
		});
		$(window).mouseup(function (_e) {
			if (playerSelected) {
				var dX = powerX - player.x;
				var dY = powerY - player.y;
				player.vX = -(dX * playerVelocityDampener);
				player.vY = -(dY * playerVelocityDampener);
				uiScore.html(++score);
			};
			playerSelected = false;
			powerX = -1;
			powerY = -1;
		});
		animate();
	};
	// Initialize the game environment
	function init() {
		uiComplete.hide();
		uiPlay.click(function (e) {
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});
		uiReset.click(function (e) {
			e.preventDefault();
			uiComplete.hide();
			startGame();
		});
	};
	// Animation loop that does all the fun stuff
	function animate() {
		// Clear
		context.clearRect(0, 0, canvasWidth, canvasHeight);
		context.fillStyle = "#c7d7c633";
		context.beginPath();
		context.arc(platformX, platformY, platformOuterRadius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();

		context.fillStyle = "#849b8366";
		context.beginPath();
		context.arc(canvasWidth - 100, canvasHeight / 2, 13 / 2, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();

		context.strokeStyle = "#8c938c33"
		context.beginPath();
		context.moveTo(canvasWidth / 4, 0)
		context.lineTo(canvasWidth / 4, canvasHeight)
		context.closePath()
		context.stroke()

		/* corner left */
		tableHoles(context, canvasWidth, canvasHeight);

		if (playerSelected) {
			context.strokeStyle = "rgb(255, 255, 255)";
			context.lineWidth = 3;
			context.beginPath();
			context.moveTo(player.x, player.y);
			context.lineTo(powerX, powerY);
			context.closePath();
			context.stroke();
		};
		if (player.x != playerOriginalX && player.y != playerOriginalY) {
			if (player.vX == 0 && player.vY == 0) {
				resetPlayer();
			} else if (player.x + player.radius < 0) {
				resetPlayer();
			} else if (player.x - player.radius > canvasWidth) {
				resetPlayer();
			} else if (player.y + player.radius < 0) {
				resetPlayer();
			} else if (player.y - player.radius > canvasHeight) {
				resetPlayer();
			};
		};

		var deadBalls = new Array();
		var ballsLength = balls.length;
		for (var i = 0; i < ballsLength; i++) {
			var tmpBall = balls[i];
			BallB(i, ballsLength, balls, tmpBall);
			// Calculate new position
			tmpBall.x += tmpBall.vX;
			tmpBall.y += tmpBall.vY;
			// Friction
			if (Math.abs(tmpBall.vX) > 0.1) {
				tmpBall.vX *= tmpBall.friction;
			} else {
				tmpBall.vX = 0;
			};
			if (Math.abs(tmpBall.vY) > 0.1) {
				tmpBall.vY *= tmpBall.friction;
			} else {
				tmpBall.vY = 0;
			};
			
			/*************************************************\
			* if the distance btn the ball and platform is
			* greater than the platform's radius make it look
			* like its falling off the platform by decreasing the
			* balls radius and thus removing it from
			* the balls array
			\**************************************************/
			if (!tmpBall.player) {
				var dXp = tmpBall.x - platformX;
				var dYp = tmpBall.y - platformY;
				var distanceP = Math.sqrt((dXp * dXp) + (dYp * dYp));
				if (distanceP > platformOuterRadius) {
					if (tmpBall.radius > 0) {
						tmpBall.radius -= 2;
					} else {
						deadBalls.push(tmpBall);
					};
				};
			}

			/***************************************************************\
			* if ball is player or 
			* black ball(smaller than player ball and white) 
			* go ahead and draw both the player and the black ball and
			* giving them collision detection against the canvas' edges and if
			* collision detected make them bounce in the opposite direction
			\**************************************************************/
			if (tmpBall.player || tmpBall.black) {
				/**********************************************************\
				* Wrapped around the try/catch statement cause 
				* when the black ball,falls of the platform it raises
				* IndexSizeError which we use to our advantage to 
				* declare player lost game since it must be the 
				* last ball to fall off the platform
				\**********************************************************/
				try {
					context.fillStyle = "rgb(255,255,255)"
					context.beginPath();
					if (tmpBall.x - tmpBall.radius < 0) {
						tmpBall.x = tmpBall.radius;
						tmpBall.vX *= -1;
						tmpBall.aX *= -1;
					} else if (tmpBall.x + tmpBall.radius > canvasWidth) {
						tmpBall.x = canvasWidth - tmpBall.radius;
						tmpBall.vX *= -1
						tmpBall.aX *= -1;
					}

					if (tmpBall.y - tmpBall.radius < 0) {
						tmpBall.y = tmpBall.radius;
						tmpBall.vY *= -1;
						tmpBall.aY *= -1;
					} else if (tmpBall.y + tmpBall.radius > canvasHeight) {
						tmpBall.y = canvasHeight - tmpBall.radius;
						tmpBall.vY *= -1
						tmpBall.aY *= -1;
					}
					/*
					* Draw player and black balls
					*/
					context.arc(tmpBall.x, tmpBall.y, tmpBall.radius, 0, Math.PI * 2,
						true);
					context.closePath();
					context.fill();
				} catch (e) {
					/*******************************\
					 * if IndexSizeError raised then
					 *  stop the game and unbind the
					 *  mouse events from window()
					 \*****************************/
					playGame = false;
					uiComplete.show();
					$(window).unbind("mousedown");
					$(window).unbind("mouseup");
					$(window).unbind("mousemove");
				}
			}
			/***************************************************************\
			* giving playerA collision detection against the canvas' edges and
			* if collision detected make it bounce in the opposite direction
			\**************************************************************/
			if (tmpBall.playerColorA) {

				if (tmpBall.x - tmpBall.radius < 0) {
					tmpBall.x = tmpBall.radius;
					tmpBall.vX *= -1;
					tmpBall.aX *= -1;
				} else if (tmpBall.x + tmpBall.radius > canvasWidth) {
					tmpBall.x = canvasWidth - tmpBall.radius;
					tmpBall.vX *= -1
					tmpBall.aX *= -1;
				}

				if (tmpBall.y - tmpBall.radius < 0) {
					tmpBall.y = tmpBall.radius;
					tmpBall.vY *= -1;
					tmpBall.aY *= -1;
				} else if (tmpBall.y + tmpBall.radius > canvasHeight) {
					tmpBall.y = canvasHeight - tmpBall.radius;
					tmpBall.vY *= -1
					tmpBall.aY *= -1;
				}
				/**
				 * Draw playerA ball
				 */
				context.fillStyle = "#c50e0e";
				context.beginPath();
				context.arc(tmpBall.x, tmpBall.y, tmpBall.radius, 0, Math.PI * 2,
					true);
				context.closePath();
				context.fill();
				context.shadowBlur = 10
				context.shadowColor = "#000"

			}
			/***************************************************************\
			* giving playerB collision detection against the canvas' edges and
			* if collision detected make it bounce in the opposite direction
			\**************************************************************/
			if (tmpBall.playerColorB) {

				if (tmpBall.x - tmpBall.radius < 0) {
					tmpBall.x = tmpBall.radius;
					tmpBall.vX *= -1;
					tmpBall.aX *= -1;
				} else if (tmpBall.x + tmpBall.radius > canvasWidth) {
					tmpBall.x = canvasWidth - tmpBall.radius;
					tmpBall.vX *= -1
					tmpBall.aX *= -1;
				}

				if (tmpBall.y - tmpBall.radius < 0) {
					tmpBall.y = tmpBall.radius;
					tmpBall.vY *= -1;
					tmpBall.aY *= -1;
				} else if (tmpBall.y + tmpBall.radius > canvasHeight) {
					tmpBall.y = canvasHeight - tmpBall.radius;
					tmpBall.vY *= -1
					tmpBall.aY *= -1;
				}
				/**
				 * Draw playerB ball
				 */
				context.fillStyle = "#e4e406e6";
				context.beginPath();
				context.arc(tmpBall.x, tmpBall.y, tmpBall.radius, 0, Math.PI * 2,
					true);
				context.closePath();
				context.fill();
			}

		};
		var deadBallsLength = deadBalls.length;
		playGame = deadBall(deadBallsLength, deadBalls, balls, uiRemaining, playGame, uiStats, uiComplete);
		if (playGame) {
			// Run the animation loop again in 33 milliseconds
			setTimeout(animate, 33);
		};
	};
	init();
});

function tableHoles(context, canvasWidth, canvasHeight) {
	context.fillStyle = "rgb(0, 0, 0)";
	context.beginPath();
	var xCL = yCL = 0;
	context.arc(xCL, yCL, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
	/* corner right */
	context.beginPath();
	var xCR = canvasWidth;
	var yCR = 0;
	context.arc(xCR, yCR, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
	/* Top center */
	context.beginPath();
	var yTC = 0;
	var xTC = canvasWidth / 2;
	context.arc(xTC, yTC, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
	/* Bottom center */
	context.beginPath();
	var yBC = canvasHeight;
	var xBC = canvasWidth / 2;
	context.arc(xBC, yBC, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
	/*corner bottom left*/
	context.beginPath();
	var xCBL = 0;
	var yCBL = canvasHeight;
	context.arc(xCBL, yCBL, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
	/*corner bottom right*/
	context.beginPath();
	var xCBR = canvasWidth;
	var yCBR = canvasHeight;
	context.arc(xCBR, yCBR, 18, 0, Math.PI * 2, false);
	context.closePath();
	context.fill();
}

function deadBall(deadBallsLength, deadBalls, balls, uiRemaining, playGame, uiStats, uiComplete) {
	if (deadBallsLength > 0) {
		for (var di = 0; di < deadBallsLength; di++) {
			var tmpDeadBall = deadBalls[di];
			balls.splice(balls.indexOf(tmpDeadBall), 1);
		}
		;
		var remaining = balls.length - 1; // Remove player from ball count
		uiRemaining.html(remaining);
		if (remaining == 0) {
			// Winner!
			playGame = false;
			uiStats.hide();
			uiComplete.show();
			$(window).unbind("mousedown");
			$(window).unbind("mouseup");
			$(window).unbind("mousemove");
		}
		;
	}
	;
	return playGame;
}

function BallB(i, ballsLength, balls, tmpBall) {
	for (var j = i + 1; j < ballsLength; j++) {
		var tmpBallB = balls[j];
		var dX = Math.floor(tmpBallB.x - tmpBall.x);
		var dY = Math.floor(tmpBallB.y - tmpBall.y);
		var distance = Math.sqrt((dX * dX) + (dY * dY));
		if (distance < tmpBall.radius + tmpBallB.radius) {
			trigonometry(dY, dX, tmpBall, tmpBallB);
		};
	};
}

function trigonometry(dY, dX, tmpBall, tmpBallB) {
	var angle = Math.atan2(dY, dX);
	var sine = Math.sin(angle);
	var cosine = Math.cos(angle);
	// Rotate ball position
	var x = 0;
	var y = 0;
	// Rotate ballB position
	var xB = dX * cosine + dY * sine;
	var yB = dY * cosine - dX * sine;
	var vX = tmpBall.vX * cosine + tmpBall.vY * sine;
	var vY = tmpBall.vY * cosine - tmpBall.vX * sine;
	// Rotate ballB velocity
	var vXb = tmpBallB.vX * cosine + tmpBallB.vY * sine;
	var vYb = tmpBallB.vY * cosine - tmpBallB.vX * sine;
	// Conserve momentum
	var vTotal = vX - vXb;
	vX = ((tmpBall.mass - tmpBallB.mass) * vX + 2 * tmpBallB.mass *
		vXb) / (tmpBall.mass + tmpBallB.mass);
	vXb = vTotal + vX;
	// Move balls apart
	xB = x + (tmpBall.radius + tmpBallB.radius);
	// Rotate ball positions back
	tmpBall.x = tmpBall.x + (x * cosine - y * sine);
	tmpBall.y = tmpBall.y + (y * cosine + x * sine);
	tmpBallB.x = tmpBall.x + (xB * cosine - yB * sine);
	tmpBallB.y = tmpBall.y + (yB * cosine + xB * sine);
	// Rotate ball velocities back
	tmpBall.vX = vX * cosine - vY * sine;
	tmpBall.vY = vY * cosine + vX * sine;
	tmpBallB.vX = vXb * cosine - vYb * sine;
	tmpBallB.vY = vYb * cosine + vXb * sine;
}

function ringMaker(ringCount, outerRing, platformInnerRadius, 
	ringSpacing, platformX, platformY, Ball, balls) {
	for (var r = 0; r < ringCount; r++) {
		var currentRing = 0; // Balls around current ring
		var angle = 0; // Angle between each ball
		var ringRadius = 0;
		// Is this the innermost ring?
		if (r == ringCount - 1) {
			currentRing = 1;
		}
		else {
			currentRing = outerRing - (r * 1);
			angle = 360 / currentRing;
			ringRadius = platformInnerRadius - (ringSpacing * r);
		}
		;
		for (var a = 0; a < currentRing / 2; a++) {
			var x = 0;
			var y = 0;
			// Is this the innermost ring?
			if (r == ringCount - 1) {
				x = platformX;
				y = platformY;
			}
			else {
				x = platformX + (ringRadius * Math.cos((angle * a) * (Math.PI / 180)));
				y = platformY + (ringRadius * Math.sin((angle * a) * (Math.PI / 180)));
			}
			;
			var radius = 10;
			var mass = 5;
			var friction = 0.97;
			playerA = new Ball(x, y, radius, mass, friction);
			playerA.playerColorA = true;
			balls.push(playerA);
		}
		;
		for (var i = 0; i < currentRing / 2; i++) {
			var x = 0;
			var y = 0;
			// Is this the innermost ring?
			if (r == ringCount + 1) {
				x = platformX;
				y = platformY;
			}
			else {
				x = platformX - (ringRadius * Math.cos((angle * i) * (Math.PI / 180)));
				y = platformY - (ringRadius * Math.sin((angle * i) * (Math.PI / 180)));
			}
			;
			var radius = 10;
			var mass = 5;
			var friction = 0.97;
			playerB = new Ball(x, y, radius, mass, friction);
			playerB.playerColorB = true;
			balls.push(playerB);
		}
		;
	}
	;
	return { x, y };
}

function declarationsUi() {
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiPlay = $("#gamePlay");
	var uiReset = $(".gameReset");
	var uiRemaining = $("#gameRemaining");
	var uiScore = $(".gameScore");
	return { uiScore, uiStats, uiRemaining, uiComplete,
		 uiPlay, uiIntro, uiReset };
}

function declarations(canvas) {
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	// Game settings
	var playGame;
	var platformX;
	var platformY;
	var platformOuterRadius;
	var platformInnerRadius;
	var balls;
	var player;
	var playerOriginalX;
	var playerOriginalY;
	var playerSelected;
	var playerMaxAbsVelocity;
	var playerVelocityDampener;
	var powerX;
	var powerY;
	var score;
	return { playerOriginalX, player, playerOriginalY, playGame,
		 platformX, canvasWidth, platformY, canvasHeight, 
		 platformOuterRadius, platformInnerRadius, balls, 
		 playerSelected, playerMaxAbsVelocity, playerVelocityDampener, 
		 powerX, powerY, score 
		};
}
