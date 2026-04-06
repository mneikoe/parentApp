const DEFAULT_CHILDREN = [
  {
    id: 'c1',
    name: 'Aarav Sharma',
    classLabel: 'Class 6-A',
    branch: 'Main Campus',
    safety: 'Safe',
    subscription: 'Active',
    trackingLastUpdate: '2 min ago',
  },
  {
    id: 'c2',
    name: 'Mira Sharma',
    classLabel: 'Class 4-B',
    branch: 'Main Campus',
    safety: 'Attention',
    subscription: 'Grace',
    trackingLastUpdate: '8 min ago',
  },
]

export function resolveParentSession({ countryCode, mobile }) {
  const rawMobile = String(mobile || '').replace(/\D/g, '')
  const parentName = `Parent ${rawMobile.slice(-4) || 'User'}`
  const normalizedMobile = `${countryCode || '+91'} ${rawMobile}`

  // Demo routing model for spec cases:
  // - endsWith 11 => linked child (full mode)
  // - endsWith 22 => child exists but pending school approval (limited mode)
  // - otherwise => parent not linked to any school
  const isLinked = rawMobile.endsWith('11')
  const isPending = rawMobile.endsWith('22')

  if (isLinked) {
    return {
      parentName,
      mobile: normalizedMobile,
      mode: 'linked',
      linkedChildren: DEFAULT_CHILDREN,
      approvedChildrenCount: DEFAULT_CHILDREN.length,
      activeChildId: DEFAULT_CHILDREN[0].id,
    }
  }

  if (isPending) {
    return {
      parentName,
      mobile: normalizedMobile,
      mode: 'pending',
      linkedChildren: [],
      approvedChildrenCount: 0,
      activeChildId: null,
      requestStatus: 'Awaiting School Approval',
    }
  }

  return {
    parentName,
    mobile: normalizedMobile,
    mode: 'unlinked',
    linkedChildren: [],
    approvedChildrenCount: 0,
    activeChildId: null,
  }
}

