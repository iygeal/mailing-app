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
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#email-view').innerHTML = `<h3>${mailbox.CharAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Load mailbox emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        const element = document.createElement('div');
        element.className = 'email-item border p-2 mb-2';
        element.style.cursor = 'pointer';
        element.style.backgroundColor = email.read ? '#f0f0f0' : 'white';

        element.innerHTML = `
          <strong>${email.sender}</strong> &nbsp;
          ${email.subject}
          <span class="text-muted float-right">${email.timestamp}</span>
        `;

        // When clicked, load the full email
        element.addEventListener('click', () => load_email(email.id));

        document.querySelector('#emails-view').append(element);
      });
    });
}

function load_email(email_id) {
  // Show single email view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Clear the email view first
  document.querySelector('#email-view').innerHTML = '';

  // Fetch email
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Populate email details
      const details = document.createElement('div');
      details.innerHTML = `
        <p><strong>From:</strong> ${email.sender}</p>
        <p><strong>To:</strong> ${email.recipients.join(', ')}</p>
        <p><strong>Subject:</strong> ${email.subject}</p>
        <p><strong>Timestamp:</strong> ${email.timestamp}</p>
        <hr>
        <p>${email.body}</p>
      `;
      document.querySelector('#email-view').append(details);

      // Mark as read
      if (!email.read) {
        fetch(`/emails/${email_id}`, {
          method: 'PUT',
          body: JSON.stringify({ read: true })
        });
      }
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
