NotificationCenter = {}
NotificationCenter.congratulate = humane.spawn({ addnCls: 'humane-flatty-success', timeout: 1000 })
NotificationCenter.error = humane.spawn({ addnCls: 'humane-flatty-error', timeout: 1000 })
NotificationCenter.info = humane.spawn({ addnCls: 'humane-flatty-info', timeout: 750 })
module.exports.NotificationCenter = NotificationCenter
