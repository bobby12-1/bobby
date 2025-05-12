function submitBooking(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.name.value;
  const email = form.email.value;
  const room = form.room.value;
  const guests = form.guests.value;
  const checkin = form.checkin.value;
  const checkout = form.checkout.value;
  const paymentMethod = form['paymentMethod'].value;

  let amount = 0;
  switch (room) {
    case "Deluxe Room":
      amount = 25000;
      break;
    case "Executive Room":
      amount = 27500;
      break;
    case "Royal Executive Room":
      amount = 30000;
      break;
  }

  if (paymentMethod === 'paystack') {
    // Convert to kobo
    const paystackAmount = amount * 100;

    const handler = PaystackPop.setup({
      key: 'pk_test_59ce0f927d8338c8caa9c08ace04e7fc760233a9', // Replace with your public key
      email: email,
      amount: paystackAmount,
      currency: 'NGN',
      ref: 'DOTMOT_' + Math.floor((Math.random() * 1000000000) + 1),
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", value: name },
          { display_name: "Room Type", value: room }
        ]
      },
      callback: function(response) {
        // Send booking details + payment reference to backend
        sendBookingToBackend({ name, email, room, guests, checkin, checkout, paymentMethod, reference: response.reference });
      },
      onClose: function() {
        alert('Payment was not completed.');
      }
    });

    handler.openIframe();
  } else {
    // Bank Transfer: Directly send to backend
    sendBookingToBackend({ name, email, room, guests, checkin, checkout, paymentMethod, reference: 'BANK_TRANSFER' });
    alert("Please make a transfer to:\nAccount Name: Dotmot Hotel\nAccount Number: 1234567890\nBank: Example Bank\n\nA confirmation email will follow once verified.");
  }
}

function sendBookingToBackend(data) {
  fetch('/api/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      alert("Booking recorded successfully!");
    })
    .catch(error => {
      console.error('Error saving booking:', error);
      alert("There was an error recording your booking.");
    });
}
