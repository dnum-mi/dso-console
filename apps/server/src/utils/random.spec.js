import { describe, it, expect } from 'vitest'
import { createRandomDbSetup } from 'test-utils'

describe('Random utils', () => {
  it('Should create a random project for tests', () => {
    expect(createRandomDbSetup({ nbUsers: 2, nbRepo: 1, envs: ['dev', 'prod'] })).toEqual(
      expect.objectContaining({
        project: expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          organization: expect.any(String),
          status: expect.any(String),
          locked: expect.any(Boolean),
        }),
        owner: expect.objectContaining({
          id: expect.any(String),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
        }),
        organization: expect.objectContaining(
          {
            id: expect.any(String),
            name: expect.any(String),
            label: expect.any(String),
          },
        ),
        users: expect.arrayContaining([{
          id: expect.any(String),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
        },
        {
          id: expect.any(String),
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
        }]),
        usersProjects: expect.arrayContaining([
          {
            UserId: expect.any(String),
            ProjectId: expect.any(String),
            role: expect.any(String),
          },
        ]),
        repositories: expect.any(Array),
        environments: expect.arrayContaining([{
          id: expect.any(String),
          name: 'dev',
          projectId: expect.any(String),
          status: expect.any(String),
        },
        {
          id: expect.any(String),
          name: 'prod',
          projectId: expect.any(String),
          status: expect.any(String),
        }]),
        permissions: expect.any(Array),
        // TODO : verifier permissions
        // permissions: expect.arrayContaining([
        //   [{
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   },
        //   {
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   }],
        //   [{
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   },
        //   {
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   }],
        //   [{
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   },
        //   {
        //     id: expect.any(String),
        //     environmentId: expect.any(String),
        //     userId: expect.any(String),
        //     level: expect.any(Boolean),
        //   }],
        // ]),
      }),
    )
  })
})
