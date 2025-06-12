
function markAttendance(action) {
  const name = document.getElementById('employeeName').value;
  if (!name) {
    alert('Please enter your name.');
    return;
  }

  fetch('http://localhost:3000/mark', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_name: name, action }),
  })
    .then(res => res.json())
    .then(data => {
      if (action === 'Check-in') {
        window.location.href = `checkin.html?name=${encodeURIComponent(name)}`;
      } else if (action === 'Check-out') {
        const checkinTime = encodeURIComponent(data.checkinTime || '--');
        const checkoutTime = encodeURIComponent(data.checkoutTime || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
        window.location.href = `checkout.html?name=${encodeURIComponent(name)}&checkin=${checkinTime}&checkout=${checkoutTime}`;
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error(err);
      alert('Something went wrong while marking attendance.');
    });
}



function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    document.getElementById('liveClock').textContent = timeString;
  }

  updateClock(); // initial call
  setInterval(updateClock, 1000); // update every second
