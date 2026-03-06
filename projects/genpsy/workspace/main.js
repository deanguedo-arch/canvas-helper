/* inline script 1 */
// Accordion Logic
        function toggleAccordion(button) {
            button.classList.toggle("active");
            var content = button.nextElementSibling;
            if (content.classList.contains("open")) {
                content.classList.remove("open");
            } else {
                content.classList.add("open");
            }
        }

        // Tabs Logic
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            
            // Hide all tab content
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            
            // Reset all button styles
            tablinks = document.getElementsByClassName("tab-btn");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-blue-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            
            // Show current tab and apply active styling
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-blue-600 text-white");
        }

        // Quiz Logic
        function checkQuiz() {
            let score = 0;
            const total = 3;
            const q1 = document.querySelector('input[name="q1"]:checked');
            const q2 = document.querySelector('input[name="q2"]:checked');
            const q3 = document.querySelector('input[name="q3"]:checked');
            
            const resultsDiv = document.getElementById("quiz-results");
            
            if(!q1 || !q2 || !q3) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the sections above and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }
