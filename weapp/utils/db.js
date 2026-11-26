const PREFIX = 'vaiananna_'

const ALIAS = [
  ['pic_url', 'picUrl'],
  ['relate_id', 'relateId'],
  ['sort_order', 'sortOrder'],
  ['link_type', 'type'],
  ['origin_price', 'originPrice'],
  ['parent_id', 'parentId'],
  ['section_id', 'sectionId'],
  ['product_id', 'productId'],
  ['spec_key', 'specKey'],
  ['spec_id', 'specId'],
  ['stock_num', 'stockNum'],
  ['order_sn', 'orderSn'],
  ['order_status', 'orderStatus'],
  ['order_id', 'orderId'],
  ['create_time', 'createTime'],
  ['pay_type', 'payType'],
  ['total_price', 'totalPrice'],
  ['express_price', 'expressPrice'],
  ['actual_price', 'actualPrice'],
  ['spec_desc', 'specDesc'],
  ['is_default', 'isDefault'],
  ['start_time', 'startTime'],
  ['end_time', 'endTime'],
  ['avatar_url', 'avatarUrl'],
  ['sku_id', 'skuId'],
  ['category_id', 'categoryId'],
  ['coupon_id', 'couponId'],
  ['red_packet_id', 'redPacketId'],
  ['comment_id', 'commentId'],
  ['express_id', 'expressId'],
  ['traced_at', 'tracedAt'],
  ['address_name', 'addressName'],
  ['address_mobile', 'addressMobile'],
  ['user_id', 'userId']
]

function init() {
  if (!wx.cloud) {
    console.error('当前基础库不支持云开发')
    return
  }
  wx.cloud.init({
    env: 'dsdsk-d9gyrm8cco97ddf9b5',
    traceUser: true
  })
}

function database() {
  return wx.cloud.database()
}

function col(name) {
  return database().collection(PREFIX + name)
}

function toView(doc) {
  if (!doc || typeof doc !== 'object') {
    return doc
  }
  const view = Object.assign({}, doc)
  view.id = doc._id || doc.id
  ALIAS.forEach(function (pair) {
    const from = pair[0]
    const to = pair[1]
    if (view[from] !== undefined && view[to] === undefined) {
      view[to] = view[from]
    }
  })
  if (Array.isArray(view.gallery)) {
    view.gallery = view.gallery.map(function (item) {
      return toView(item)
    })
  }
  if (view.service_list && !view.serviceList) {
    view.serviceList = view.service_list
  }
  return view
}

function list(name, where) {
  let query = col(name)
  if (where) {
    query = query.where(where)
  }
  return query.limit(100).get().then(function (res) {
    return (res.data || []).map(toView)
  })
}

function get(name, id) {
  return col(name).doc(id).get().then(function (res) {
    return toView(res.data)
  })
}

function mine(name, extra) {
  return list(name, Object.assign({ _openid: '{openid}' }, extra || {}))
}

function add(name, data) {
  return col(name).add({ data: data }).then(function (res) {
    return res._id
  })
}

function update(name, id, data) {
  return col(name).doc(id).update({ data: data })
}

function remove(name, id) {
  return col(name).doc(id).remove()
}

function regexp(keyword) {
  const safe = String(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return database().RegExp({
    regexp: safe,
    options: 'i'
  })
}

function bySort(list) {
  return list.slice().sort(function (a, b) {
    return (a.sortOrder || 0) - (b.sortOrder || 0)
  })
}

function buildSections(sections, items) {
  const sortedItems = bySort(items)
  return bySort(sections).map(function (section) {
    section.list = sortedItems.filter(function (item) {
      return String(item.sectionId || item.section_id) === String(section.id)
    })
    return section
  })
}

function buildCategoryTree(flat) {
  const nodes = flat.map(function (item) {
    return Object.assign({}, item, { children: [] })
  })
  const byParent = {}
  nodes.forEach(function (node) {
    const parent = node.parentId === undefined || node.parentId === null || node.parentId === '' ? '0' : String(node.parentId)
    const key = parent === '0' ? '0' : parent
    if (!byParent[key]) {
      byParent[key] = []
    }
    byParent[key].push(node)
  })
  Object.keys(byParent).forEach(function (key) {
    byParent[key] = bySort(byParent[key])
  })
  const tops = byParent['0'] || []
  return tops.map(function (top) {
    let groups = byParent[String(top.id)] || []
    const hasGrandChildren = groups.some(function (group) {
      return (byParent[String(group.id)] || []).length > 0
    })
    if (hasGrandChildren) {
      groups.forEach(function (group) {
        group.children = byParent[String(group.id)] || []
      })
    } else if (groups.length) {
      groups = [{
        id: String(top.id) + '-group',
        title: '',
        children: groups
      }]
    }
    top.children = groups
    return top
  })
}

module.exports = {
  PREFIX: PREFIX,
  init: init,
  col: col,
  list: list,
  get: get,
  mine: mine,
  add: add,
  update: update,
  remove: remove,
  regexp: regexp,
  toView: toView,
  buildSections: buildSections,
  buildCategoryTree: buildCategoryTree
}
