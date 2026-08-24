// Snapshot adaptation: retain the page's print action without unavailable print CSS or unused MathJax assets.
$(document).ready(function(){
	"use strict";
	$('<p class="CentreAlign PrintText"><em><a href="#" data-print-page>Print</a> a copy of this page.</em></p>').insertAfter('#header');
	$('[data-print-page]').on('click', function(event){
		event.preventDefault();
		window.print();
	});
});
