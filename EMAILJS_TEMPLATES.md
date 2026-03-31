# EmailJS Template Designs


Copy these into EmailJS so both emails are clean, branded, and easy to scan.

## Contact Us form template

Recommended EmailJS template ID: `template_contact_xxxxxxx`

Subject:

```text
{{subject}}
```

Body (HTML):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f7;padding:24px 0;font-family:Arial,sans-serif;color:#1d2630;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #dde3ea;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:24px;background:#1f4d2e;color:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 8px 0 0;vertical-align:middle;">
                  <img src="{{favicon_url}}" alt="" width="24" height="24" style="display:block;width:24px;height:24px;border-radius:4px;background:#ffffff;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">{{source_label}}</p>
                </td>
              </tr>
            </table>
            <img src="{{logo_url}}" alt="{{business_name}} logo" width="180" style="display:block;margin:12px 0 10px;width:180px;max-width:100%;height:auto;" />
            <h1 style="margin:10px 0 6px;font-size:24px;line-height:1.3;">{{inquiry_heading}}</h1>
            <p style="margin:0;font-size:14px;opacity:.95;">{{preview_text}}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Submitted</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{submitted_at}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Name</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{from_name}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Email</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{from_email}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Phone</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{phone}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Country</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{country}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Help topic</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{help_topic}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Preferred contact</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{preferred_contact_method}}</td>
              </tr>
            </table>

            <div style="margin:18px 0 0;border:1px solid #e4e8ed;border-radius:10px;padding:14px;background:#fafbfd;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6c7a;">Additional details</p>
              <p style="margin:0;font-size:14px;line-height:1.6;">{{additional_details}}</p>
            </div>

            <div style="margin:16px 0 0;border:1px solid #e4e8ed;border-radius:10px;padding:14px;background:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6c7a;">Full message</p>
              <pre style="margin:0;white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#26323e;">{{message_plain}}</pre>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 22px;background:#f6f8fb;border-top:1px solid #e1e6ec;">
            <p style="margin:0 0 6px;font-size:13px;color:#374552;">{{business_name}}</p>
            <p style="margin:0;font-size:12px;color:#627180;">
              {{business_email}} | {{business_phone_primary}}, {{business_phone_secondary}}, {{business_phone_tertiary}}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## Request A Tour form template

Recommended EmailJS template ID: `template_custom_tour_xxxxxxx`

Subject:

```text
{{subject}}
```

Body (HTML):

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f7;padding:24px 0;font-family:Arial,sans-serif;color:#1d2630;">
  <tr>
    <td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #dde3ea;border-radius:14px;overflow:hidden;">
        <tr>
          <td style="padding:24px;background:#274a74;color:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:0 8px 0 0;vertical-align:middle;">
                  <img src="{{favicon_url}}" alt="" width="24" height="24" style="display:block;width:24px;height:24px;border-radius:4px;background:#ffffff;" />
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.9;">{{source_label}}</p>
                </td>
              </tr>
            </table>
            <img src="{{logo_url}}" alt="{{business_name}} logo" width="180" style="display:block;margin:12px 0 10px;width:180px;max-width:100%;height:auto;" />
            <h1 style="margin:10px 0 6px;font-size:24px;line-height:1.3;">{{inquiry_heading}}</h1>
            <p style="margin:0;font-size:14px;opacity:.95;">{{preview_text}}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:22px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Submitted</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{submitted_at}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Name</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{from_name}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Email</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{from_email}}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#6b7785;font-size:13px;">Phone</td>
                <td style="padding:8px 0;text-align:right;font-size:13px;">{{phone}}</td>
              </tr>
            </table>

            <div style="margin:18px 0 0;border:1px solid #e4e8ed;border-radius:10px;padding:14px;background:#fafbfd;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6c7a;">Trip details</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Tour name:</strong> {{tour_name}}</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Duration (days):</strong> {{duration_days}}</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Destination:</strong> {{destination}}</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Interests:</strong> {{interests}}</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Travel style:</strong> {{travel_style}}</p>
              <p style="margin:0 0 4px;font-size:14px;line-height:1.6;"><strong>Group size:</strong> {{group_size}}</p>
              <p style="margin:0;font-size:14px;line-height:1.6;"><strong>Budget:</strong> {{budget}}</p>
            </div>

            <div style="margin:16px 0 0;border:1px solid #e4e8ed;border-radius:10px;padding:14px;background:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6c7a;">Additional notes</p>
              <p style="margin:0;font-size:14px;line-height:1.6;">{{notes}}</p>
            </div>

            <div style="margin:16px 0 0;border:1px solid #e4e8ed;border-radius:10px;padding:14px;background:#ffffff;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5f6c7a;">Full message</p>
              <pre style="margin:0;white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#26323e;">{{message_plain}}</pre>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 22px;background:#f6f8fb;border-top:1px solid #e1e6ec;">
            <p style="margin:0 0 6px;font-size:13px;color:#374552;">{{business_name}}</p>
            <p style="margin:0;font-size:12px;color:#627180;">
              {{business_email}} | {{business_phone_primary}}, {{business_phone_secondary}}, {{business_phone_tertiary}}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
```

## Variables sent by the app

Common:
- `to_email`
- `business_name`
- `business_email`
- `business_phone_primary`
- `business_phone_secondary`
- `business_phone_tertiary`
- `business_website`
- `logo_url`
- `favicon_url`
- `from_name`
- `from_email`
- `reply_to`
- `subject`
- `message`
- `message_plain`
- `source`
- `source_label`
- `inquiry_heading`
- `preview_text`
- `submitted_at`

Contact-only:
- `phone`
- `country`
- `help_topic`
- `preferred_contact_method`
- `additional_details`

Custom-tour-only:
- `phone`
- `tour_name`
- `duration_days`
- `destination`
- `interests`
- `travel_style`
- `group_size`
- `budget`
- `notes`
