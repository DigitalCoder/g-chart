function PieChart(container, data, label, tooltip) {
	this.container = container;
	this.data = data;
	this.label = label;
	this.tooltip = tooltip;
	this.context = this.container.getContext("2d");
	
	this.centerX = Math.floor(this.container.width  / 2);
	this.centerY = Math.floor(this.container.height / 2);
	this.radius  = Math.floor(this.container.width  / 2);
	
	this.slices = [];
}
PieChart.prototype = {
	constructor: PieChart,
	tooltipOn: function (which) {
		if(which === 'click')
			this.container.addEventListener('click', this.clickEvent.bind(this));
		else if(which === 'mousemove')
			this.container.addEventListener('mousemove', this.hoverEvent.bind(this));
		else 
			console.log('Tooltip activation method not supported');
	},
	
	draw: function () {
		var data_length = this.data.length;
		var data_sum = this.getSumUntil(this.data.length);
		var sum_before_this, sum_after_this = 0;
		var start_angle, end_angle = 0;
		
		for(var i = 0 ; i < data_length ; i++) {
			sum_before_this = this.getSumUntil(i);
			sum_after_this = i === data_length -1 ? data_sum : this.getSumUntil(i +1);
			start_angle = this.getAngle(data_sum, sum_before_this);
			end_angle = this.getAngle(data_sum, sum_after_this);
			this.drawSegment(start_angle, end_angle, this.label[i]);
			
			this.slices.push({
				start: start_angle, 
				end  : end_angle,
				value: this.data[i],
				label: this.label[i],
				tooltip: this.tooltip[i]
			});
		}
	},
	drawSegment: function (start, end, label) {
    this.context.save();

		this.context.beginPath();
    this.context.moveTo(this.centerX, this.centerY);
    this.context.arc(this.centerX, this.centerY, this.radius, start, end);
    this.context.closePath();

    this.context.fillStyle = this.getRandomColor();
    this.context.fill();

    this.context.restore();
		
		this.drawLabel(label, start, end);
	},
	drawLabel: function (text, start, end) {
		this.context.save();

		this.context.translate(this.centerX, this.centerY);
		this.context.rotate(( start + end ) / 2);
		var dx = Math.floor(this.centerX) - 10;
		var dy = Math.floor(this.centerY * 0.05);

		this.context.textAlign = "right";
		var fontSize = Math.floor(this.centerY / 10);
		this.context.font = fontSize + "pt Helvetica";

    this.context.fillStyle = '#FFF';
		this.context.fillText(text, dx, dy);

		this.context.restore();
	},
	
	getAngle: function (total, sum) {
		return this.degreesToRadians( ( 360 * sum ) / total );
	},
	getSumUntil: function (index) {
		var result = 0;
		for(var i = 0 ; i < index ; i++) result += this.data[i];
		return result;
	},
	getRandomColor: function () {
			var letters = '0123456789ABCDEF';
			var color = '#';
			for (var i = 0; i < 6; i++ )
					color += letters[Math.floor(Math.random() * 16)];
			return color;
	},
	degreesToRadians: function (degrees) {
			return (degrees * Math.PI)/180;
	},
	
	clickEvent: function (event) {
		if(this.isInsidePie(event.clientX, event.clientY)) {
			var slice_clicked = this.getSlice(event.clientX, event.clientY);
			this.showTooltip(slice_clicked, event.clientX, event.clientY);
		} else {
			this.removeTooltip();
		}
	},
	hoverEvent: function (event) {
		if(this.isInsidePie(event.clientX, event.clientY)) {
			var slice_hovered = this.getSlice(event.clientX, event.clientY);
			this.showTooltip(slice_hovered, event.clientX, event.clientY);
		} else {
			this.removeTooltip();
		}
	},
	isInsidePie: function (x, y) {
		return this.distanceBetweenTwoPoints(
				{ x: this.centerX , y: this.centerY },
				{ x: x , y: y }
			) <= this.radius;
	},
	distanceBetweenTwoPoints: function (p1, p2) {
		var _x = p1.x - p2.x;
		var _y = p1.y - p2.y;
		return Math.sqrt( Math.pow(_x, 2) + Math.pow(_y, 2) );
	},
	getSlice: function (x_position, y_position) {
		var angle = this.getAngleOfCoordinate(x_position, y_position);
		var slices_length = this.slices.length;
		for (var i = 0 ; i < slices_length ; i++)
			if(angle >= this.slices[i].start && angle <= this.slices[i].end)
				return this.slices[i];
	},
	getAngleOfCoordinate: function (x_position, y_position) {
		var _x = this.centerX - x_position;
		var _y = this.centerY - y_position;
		return Math.atan2(_y, _x) + Math.PI;
	},
	
	showTooltip: function (slice, x, y) {
		var tooltip = document.getElementById('tooltip');
		if(tooltip) {
			tooltip.style.top = y + 'px';
			tooltip.style.left = x + 'px';
			tooltip.innerHTML = slice.tooltip;
		} else {
			tooltip = document.createElement('div');
			tooltip.setAttribute('id', 'tooltip');
			tooltip.classList.add('tooltip-pie-chart');
			tooltip.style.top = y + 'px';
			tooltip.style.left = x + 'px';
			tooltip.innerHTML = slice.tooltip;
			this.container.parentNode.appendChild(tooltip);
		}
	},
	removeTooltip: function () {
		var tooltip = document.getElementById('tooltip');
		if(tooltip)
			this.container.parentNode.removeChild(tooltip);
	}
};
