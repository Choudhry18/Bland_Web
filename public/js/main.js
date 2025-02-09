// Tab switching function
function openTab(evt, tabName) {
    // Hide all tab contents
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
      tabcontent[i].classList.remove("active");
    }

    // Remove 'active' class from all tab buttons
    const tablinks = document.getElementsByClassName("tab");
    for (let i = 0; i < tablinks.length; i++) {
      const activeBtn = tablinks[i].querySelector("button.active");
      if (activeBtn) activeBtn.classList.remove("active");
    }

    // Show the selected tab and mark the button as active
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
  }

  // Default to showing the interpreter tab
  document.getElementById("interpreter").style.display = "block";

  // Create a WebSocket connection to the backend
  const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const socket = new WebSocket(protocol + location.host);

  // Listen for messages from the server (PTY output)
  socket.onmessage = function(event) {
    const outputElem = document.getElementById("output");
    outputElem.textContent += event.data;
  };

  // Form submission handler to send code via WebSocket
  document.getElementById("codeForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const code = document.getElementById("codeInput").value;
    // Send the code with newline appended so the backend processes it correctly
    socket.send(code + "\n");
  });