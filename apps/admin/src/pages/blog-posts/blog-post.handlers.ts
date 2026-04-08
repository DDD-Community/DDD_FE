import { faker } from "@faker-js/faker/locale/ko"
import { http, HttpResponse } from "msw"

import type { BlogPostInfo, BlogPostStatus } from "./types"

const createBlogPost = (overrides?: Partial<BlogPostInfo>): BlogPostInfo => ({
  id: faker.string.uuid(),
  title: faker.lorem.sentence({ min: 4, max: 8 }),
  author: faker.person.fullName(),
  category: faker.helpers.arrayElement(["개발", "디자인", "기획", "협업", "회고"]),
  status: faker.helpers.arrayElement<BlogPostStatus>(["published", "draft", "archived"]),
  publishedAt: faker.date.past().toISOString(),
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

const createBlogPostList = (count = 10): BlogPostInfo[] =>
  Array.from({ length: count }, () => createBlogPost())

export const blogPostHandlers = [
  http.get(`${import.meta.env.VITE_API_URL}/blog-post`, () => {
    return HttpResponse.json({
      code: "SUCCESS",
      data: createBlogPostList(),
      message: null,
    })
  }),
]
