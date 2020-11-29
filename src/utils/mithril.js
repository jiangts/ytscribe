m.n = (tags, ...rest) => {
  const parts = tags.split('>')
  return parts.reduceRight((child, tag) => m(tag.trim(), child), m(parts.pop().trim(), ...rest))
}

