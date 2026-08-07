import { useState } from 'react';
import api from '../api/axios';
import { communionNote, sundayServices } from '../data/services';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setStatus({ type: 'success', message: 'Message sent. We will be in touch soon.' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Could not send message',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-banner">
        <h1>Contact</h1>
        <p>We would love to hear from you—questions, prayer, or a plan to visit.</p>
      </header>

      <section className="section">
        <div className="section-inner contact-layout">
          <div className="contact-info">
            <h2>Visit us</h2>
            <p>Near HP Gas Station Road</p>
            <p>Gannavaram, Andhra Pradesh</p>
            <h3>Sunday worship services</h3>
            <ul className="service-details">
              {sundayServices.map((service) => (
                <li key={service.id}>
                  <strong>{service.name}</strong>
                  <span>{service.location}</span>
                  <span>{service.time}</span>
                </li>
              ))}
            </ul>
            <p>
              <strong>{communionNote.title}</strong> — {communionNote.schedule}
            </p>
            <p>
              <a href="mailto:hello@penieleevangelicalfellowship.org">
                hello@penieleevangelicalfellowship.org
              </a>
            </p>
          </div>

          <form className="form-panel" onSubmit={onSubmit}>
            <label>
              Name
              <input name="name" required value={form.name} onChange={onChange} />
            </label>
            <label>
              Email
              <input type="email" name="email" required value={form.email} onChange={onChange} />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={onChange} />
            </label>
            <label>
              Subject
              <input name="subject" required value={form.subject} onChange={onChange} />
            </label>
            <label>
              Message
              <textarea name="message" rows="5" required value={form.message} onChange={onChange} />
            </label>
            {status.message && <p className={`form-status ${status.type}`}>{status.message}</p>}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
