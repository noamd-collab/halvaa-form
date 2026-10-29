// ===== הצהרות הלוואה – מקבל PDF מהטופס, שולח לך במייל, שומר עותק בדרייב =====

var TOKEN = 'noam-halvaa-2026';
var FOLDER_NAME = 'הצהרות הלוואה';

function doPost(e) {
  var out = function (o) {
    return ContentService.createTextOutput(JSON.stringify(o))
      .setMimeType(ContentService.MimeType.JSON);
  };
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out({ ok: false, error: 'bad token' });
    if (!d.pdf || !d.name) return out({ ok: false, error: 'missing data' });

    var bytes = Utilities.base64Decode(d.pdf);
    var fname = 'הצהרת הלוואה - ' + d.name + '.pdf';
    var blob = Utilities.newBlob(bytes, 'application/pdf', fname);

    var file = getFolder_().createFile(blob);

    var body = [
      'התקבלה הצהרת הלוואה חתומה.',
      '',
      'מלווה: ' + d.name,
      'ת.ז.: ' + d.id,
      'טלפון: ' + d.phone,
      'יישוב: ' + (d.city || '-'),
      'מייל: ' + (d.copyTo || '-'),
      '',
      'סכום: ' + d.amount + ' שח',
      'תאריך העברה: ' + d.date,
      'אמצעי: ' + d.method,
      'לחשבון: ' + d.to,
      'מחשבון: ' + (d.bank || '-'),
      'מועד החזר: ' + d.repay,
      'תאריך חתימה: ' + d.sigDate,
      'נחתם: ' + d.stamp,
      '',
      'עותק בדרייב: ' + file.getUrl()
    ].join('\n');

    var me = Session.getEffectiveUser().getEmail();
    MailApp.sendEmail({
      to: me,
      subject: 'הצהרת הלוואה - ' + d.name + ' - ' + d.amount,
      body: body,
      attachments: [blob],
      name: 'טופס הצהרת הלוואה'
    });

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function doGet() {
  return ContentService.createTextOutput('ok');
}
