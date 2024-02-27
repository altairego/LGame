const ver="0.3.2";

// L: 0,0
// fliph: 1
// rotate: +1
const LP_SZ = 83;
const LP_BOARD = 
    '<table class="board">'+
        '<tr><td id="b00"></td><td id="b01"></td><td id="b02"></td><td id="b03"></td></tr>'+
        '<tr><td id="b10"></td><td id="b11"></td><td id="b12"></td><td id="b13"></td></tr>'+
        '<tr><td id="b20"></td><td id="b21"></td><td id="b22"></td><td id="b23"></td></tr>'+
        '<tr><td id="b30"></td><td id="b31"></td><td id="b32"></td><td id="b33"></td></tr>'+
    '</table>';
const LP_SHAPES = [
	[
		{w:2, h: 3, shape: [
			{x:0, y:0},
			{x:0, y:1},
			{x:0, y:2},
			{x:1, y:2},
		]},
		{w:3, h: 2, shape: [
			{x:0, y:0},
			{x:1, y:0},
			{x:2, y:0},
			{x:0, y:1},
		]},
		{w:2, h: 3, shape: [
			{x:1, y:0},
			{x:1, y:1},
			{x:1, y:2},
			{x:0, y:0},
		]},
		{w:3, h: 2, shape: [
			{x:0, y:1},
			{x:1, y:1},
			{x:2, y:1},
			{x:2, y:0},
		]},
	],
	[
		{w:2, h: 3, shape: [
			{x:1, y:0},
			{x:1, y:1},
			{x:1, y:2},
			{x:0, y:2},
		]},
		{w:3, h: 2, shape: [
			{x:0, y:1},
			{x:1, y:1},
			{x:2, y:1},
			{x:0, y:0},
		]},
		{w:2, h: 3, shape: [
			{x:0, y:0},
			{x:0, y:1},
			{x:0, y:2},
			{x:1, y:0},
		]},
		{w:3, h: 2, shape: [
			{x:0, y:0},
			{x:1, y:0},
			{x:2, y:0},
			{x:2, y:1},
		]},
	],
];

LPlayer = function(face, dir, col, row) {
	var $p = $('<div class="LPlayer"><div></div><div></div><div></div><div></div></div>');
	
	return {
		$p:   $p,
		col:  col||0,
        row:  row||0,
        face: face||0,
        dir:  dir||0,
        cells: [],
        flip: function() {
            this.face = 1 - this.face;
            this.build();
            return this;
        },
        rotate: function(ccw) {
            this.dir += (ccw?3:1);
            this.dir %= 4;
            this.build();
            // test if out of bounds
            return this;
        },
		build: function() {
            var self = this;
            this.cells = LP_SHAPES[this.face][this.dir];
            this.$p.css({
                width:(this.cells.w*LP_SZ) + "px",
                height:(this.cells.h*LP_SZ) + "px"
            }).find(">div").each(function(_c){
                $(this).css({left: (self.cells.shape[_c].x * LP_SZ) + "px", top: (self.cells.shape[_c].y * LP_SZ) + "px"});
            });
            return this.place();
        },
		place: function() {
            this.cells = LP_SHAPES[this.face][this.dir];
            this.col = Math.max(0,Math.min(this.col,4-this.cells.w));
            this.row = Math.max(0,Math.min(this.row,4-this.cells.h));
            $p.css({
                left: (LP_SZ*this.col)+"px",
                top:  (LP_SZ*this.row)+"px"
            });
            return this;
        },
		move: function(c,r) {
            this.col = c;
            this.row = r;
            this.place();
            return this;
		}
	};
};

LMark = function(col, row) {
	var $p = $('<div class="LMark"></div>');

	return {
		$p: $p,
		col, row,
		place: function() {
            this.col = Math.max(0,Math.min(this.col,3));
            this.row = Math.max(0,Math.min(this.row,3));
            $p.css({
                left: (LP_SZ*this.col)+"px",
                top:  (LP_SZ*this.row)+"px"
            });
            return this;
        },
		move: function(c,r) {
            this.col = c;
            this.row = r;
            this.place();
            return this;
		}
	};
};

LGame = function(board) {
	var $board = $(board);
    var current = false;
	var game = {
		players: [
			LPlayer(1, 2, 1, 0), // flip, turn 180, col 1, row 0
			LPlayer(1, 0, 1, 1), // flip, turn 0,   col 1, row 1
		],
		marks: [
			LMark(0,0), // flip, turn 180, col 1, row 0
			LMark(3,3), // flip, turn 0,   col 1, row 1
		],
        next() {
            if (current === false)
                current = 0;
            else
                current = (current + 1) % 2;

            game.players[current].$p.css({zIndex: 20, opacity: 1}).draggable( "enable" );;
            game.players[1-current].$p.css({zIndex: 10, opacity: 0.3}).draggable( "disable" );;
        },
        flip() {
            game.players[current].flip();
        },
        rotatecw() {
            game.players[current].rotate();
        },
        rotateccw() {
            game.players[current].rotate(true);
        }
	};
	
	$board.html(LP_BOARD);
	$board.append(game.players[0].build().place().$p.addClass('p1').data({type:'player',id:0}));
	$board.append(game.players[1].build().place().$p.addClass('p2').data({type:'player',id:1}));
	$board.append(game.marks[0].place().$p.data({type:'mark',id:0}));
	$board.append(game.marks[1].place().$p.data({type:'mark',id:1}));

    $board.find(".LPlayer, .LMark" ).draggable({
        grid: [ LP_SZ, LP_SZ],
		drag: function( event, ui ) {
			if ($(event.target).data().type==='player') {
				game.players[current].col = Math.round(ui.position.left/LP_SZ);
				game.players[current].row = Math.round(ui.position.top/LP_SZ);
				game.players[current].place();
				ui.position.left = game.players[current].col * LP_SZ;
				ui.position.top = game.players[current].row * LP_SZ;
			} else {
				game.marks[$(event.target).data().id].col = Math.round(ui.position.left/LP_SZ);
				game.marks[$(event.target).data().id].row = Math.round(ui.position.top/LP_SZ);
				game.marks[$(event.target).data().id].place();
				ui.position.left = game.marks[$(event.target).data().id].col * LP_SZ;
				ui.position.top = game.marks[$(event.target).data().id].row * LP_SZ;
			}			
		}
    });
    
    game.next();
	return game;
};

game = LGame("#playground");
console.log(game);

function restartGame() {
    game = LGame("#playground");
}


$( "#btn-restart" ).button().click(restartGame);
$( "#btn-settings" ).button();
$( "#btn-flip" ).button().click(function(){game.flip()});
$( "#btn-next" ).button().click(function(){game.next()});
$( "#btn-turncw" ).button().click(function(){game.rotatecw()});
$( "#btn-turnccw" ).button().click(function(){game.rotateccw()});
$("#ver").html(ver);
