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
            const questions = document.querySelectorAll(".quiz-q");
            const total = questions.length;
            let answered = 0;

            const resultsDiv = document.getElementById("quiz-results");

            questions.forEach((question) => {
                const selected = question.querySelector('input[type="radio"]:checked');
                if (selected) {
                    answered += 1;
                    if (selected.value === "correct") {
                        score += 1;
                    }
                }
            });

            if (answered !== total) {
                const unanswered = total - answered;
                resultsDiv.innerHTML = `Please answer all questions before submitting. (${unanswered} remaining)`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block";
                return;
            }

            if (score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else if (score >= Math.ceil(total * 0.75)) {
                resultsDiv.innerHTML = `Strong work: ${score}/${total}. You're close to mastery - review the missed topics and re-test.`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-blue-100 text-blue-800 border border-blue-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Revisit Parts 4-6 and try again.`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }
