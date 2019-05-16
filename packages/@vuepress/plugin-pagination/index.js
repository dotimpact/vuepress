const {path} = require('@vuepress/shared-utils')

function getIntervallers(max, interval) {
  const count = max % interval === 0 ? Math.floor(max / interval) : Math.floor(max / interval) + 1
  const arr = [...Array(count)]
  return arr.map((v, index) => {
    const start = index * interval
    const end = (index + 1) * interval
    return [start, end > max ? max : end]
  })
}

function getPagination(posts, options, postsFilter, postsSorter) {
  const {
    perPagePosts = 10,
    paginationDir = 'page',
    firstPagePath = '/',
    layout = 'Layout'
  } = options

  const intervallers = getIntervallers(posts.length, perPagePosts)
  return {
    paginationPages: intervallers.map((interval, index) => {
      const path = index === 0
        ? firstPagePath
        : `/${paginationDir}/${index + 1}/`
      return {path, interval}
    }),
    postsFilter: postsFilter.toString(),
    postsSorter: postsSorter.toString()
  }

}

module.exports = (options, ctx) => ({
  enhanceAppFiles: [
    path.resolve(__dirname, 'enhanceAppFile.js')
  ],

  ready() {
    let {postsFilter, postsSorter} = options
    postsFilter = postsFilter || (({type}) => type === 'post')
    postsSorter = postsSorter || ((prev, next) => {
      const prevTime = new Date(prev.frontmatter.date).getTime()
      const nextTime = new Date(next.frontmatter.date).getTime()
      return prevTime - nextTime > 0 ? -1 : 1
    })

    const {pages} = ctx
    const posts = pages.filter(postsFilter)
    const pagination = getPagination(posts, options, postsFilter, postsSorter)

    ctx.pagination = pagination
    pagination.paginationPages.forEach(({path}, index) => {
      if (path === '/') {
        return
      }
      ctx.addPage({
        permalink: path,
        frontmatter: {
          layout,
          title: `Page ${index + 1}`
        }
      })
    })

    if (ctx.tagMap) {
      const tagPagination = getPagination(Object.keys(ctx.tagMap), {
        ...options,
        firstPagePath: '/tag'
      }, postsFilter, postsSorter)
      ctx.tagPagination = tagPagination
      tagPagination.paginationPages.forEach(({path}, index) => {
        if (path === '/') {
          return
        }
        ctx.addPage({
          permalink: path,
          frontmatter: {
            layout: 'Tag',
            title: `Tag | Page ${index + 1}`
          }
        })
      })
    }
  },

  async clientDynamicModules() {
    const =
    modules = [
      {
        name: 'pagination.js',
        content: `export default ${JSON.stringify(ctx.pagination, null, 2)}`
      }
    ]

    if (ctx.tagPagination) {
      modules.push({
        name: 'tag-pagination.js',
        content: `export default ${JSON.stringify(ctx.tagPagination, null, 2)}`
      })
    } else {
      modules.push({
        name: 'tag-pagination.js',
        content: `export default const null`
      })
    }
  }

    return modules;
  })
