document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Handle form submission
  document
    .querySelector('#compose-form')
    .addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear out the emails-view and show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Fetch the emails for this mailbox from the API
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);

      // Loop through each email and create a "box" for it
      emails.forEach((email) => {
        // Create a container div for this email
        const element = document.createElement('div');
        element.className = 'list-group-item';

        // Display sender, subject, and timestamp
        element.innerHTML = `
          <strong>${email.sender}</strong> &nbsp; ${email.subject}
          <span class="text-muted float-right">${email.timestamp}</span>
        `;

        // Style based on whether the email has been read
        if (email.read) {
          element.style.backgroundColor = '#e9ecef'; // light gray
        } else {
          element.style.backgroundColor = 'white'; // white for unread email
        }

        // Add the element to the page
        document.querySelector('#emails-view').append(element);
      });
    });
}

// Logic to send email
function send_email(event) {

  // Stop form from submitting by default so send_email handles it
  event.preventDefault();

  // Get the form values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send a POST request with the values of the form
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      // Log result for debugging
      console.log(result);

      // Load sent mail box
      load_mailbox('sent');
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
