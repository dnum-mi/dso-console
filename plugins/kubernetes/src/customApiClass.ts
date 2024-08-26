// @ts-nocheck

// Code dupliqué et modifier de https://github.com/kubernetes-client/javascript/blob/0.20.0/src/gen/api/customObjectsApi.ts

import localVarRequest from 'request'
import http from 'http'

/* tslint:disable:no-unused-locals */
import { V1DeleteOptions, ObjectSerializer, Authentication, VoidAuth, Interceptor, ApiKeyAuth, HttpError } from '@kubernetes/client-node'

const defaultBasePath = 'http://localhost'

export enum CustomObjectsApiApiKeys {
  BearerToken,
}

export type UrlParams = {
  namespace?: string
  group?: string
  version: string
  plural: string
  name?: string
}

export class AnyObjectsApi {
  protected _basePath = defaultBasePath
  protected _defaultHeaders: any = {}
  protected _useQuerystring: boolean = false

  protected authentications = {
    default: <Authentication> new VoidAuth(),
    BearerToken: new ApiKeyAuth('header', 'authorization'),
  }

  protected interceptors: Interceptor[] = []

  constructor(basePath?: string)
  constructor(basePathOrUsername: string, password?: string, basePath?: string) {
    if (password) {
      if (basePath) {
        this.basePath = basePath
      }
    } else {
      if (basePathOrUsername) {
        this.basePath = basePathOrUsername
      }
    }
  }

  set useQuerystring(value: boolean) {
    this._useQuerystring = value
  }

  set basePath(basePath: string) {
    this._basePath = basePath
  }

  set defaultHeaders(defaultHeaders: any) {
    this._defaultHeaders = defaultHeaders
  }

  get defaultHeaders() {
    return this._defaultHeaders
  }

  get basePath() {
    return this._basePath
  }

  private urlMaker = ({ plural, version, group, name, namespace }: UrlParams) => {
    const path: string[] = [this.basePath]
    if (group) {
      path.push('apis')
      path.push(encodeURIComponent(String(group)))
    } else path.push('api')
    path.push(encodeURIComponent(String(version)))
    if (namespace) {
      path.push('namespaces')
      path.push(encodeURIComponent(String(namespace)))
    }
    path.push(encodeURIComponent(String(plural)))
    if (name) path.push(encodeURIComponent(String(name)))
    return path.join('/')
  }

  public setDefaultAuthentication(auth: Authentication) {
    this.authentications.default = auth
  }

  public setApiKey(key: CustomObjectsApiApiKeys, value: string) {
    (this.authentications as any)[CustomObjectsApiApiKeys[key]].apiKey = value
  }

  public addInterceptor(interceptor: Interceptor) {
    this.interceptors.push(interceptor)
  }

  /**
     * Creates a namespace scoped Custom object
     * @param group The custom resource\&#39;s group name
     * @param version The custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural The custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param body The JSON schema of the Resource to create.
     * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param fieldManager fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
     */
  public async createNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, body: object, pretty?: string, dryRun?: string, fieldManager?: string, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling createNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling createNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling createNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling createNamespacedCustomObject.')
    }

    // verify required parameter 'body' is not null or undefined
    if (body === null || body === undefined) {
      throw new Error('Required parameter body was null or undefined when calling createNamespacedCustomObject.')
    }

    if (pretty !== undefined) {
      localVarQueryParameters.pretty = ObjectSerializer.serialize(pretty, 'string')
    }

    if (dryRun !== undefined) {
      localVarQueryParameters.dryRun = ObjectSerializer.serialize(dryRun, 'string')
    }

    if (fieldManager !== undefined) {
      localVarQueryParameters.fieldManager = ObjectSerializer.serialize(fieldManager, 'string')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'POST',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(body, 'object'),
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }

  /**
     * Deletes the specified namespace scoped custom object
     * @param group the custom resource\&#39;s group
     * @param version the custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural the custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param name the custom object\&#39;s name
     * @param gracePeriodSeconds The duration in seconds before the object should be deleted. Value must be non-negative integer. The value zero indicates delete immediately. If this value is nil, the default grace period for the specified type will be used. Defaults to a per object value if not specified. zero means delete immediately.
     * @param orphanDependents Deprecated: please use the PropagationPolicy, this field will be deprecated in 1.7. Should the dependent objects be orphaned. If true/false, the \&quot;orphan\&quot; finalizer will be added to/removed from the object\&#39;s finalizers list. Either this field or PropagationPolicy may be set, but not both.
     * @param propagationPolicy Whether and how garbage collection will be performed. Either this field or OrphanDependents may be set, but not both. The default policy is decided by the existing finalizer set in the metadata.finalizers and the resource-specific default policy.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param body
     */
  public async deleteNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, name: string, gracePeriodSeconds?: number, orphanDependents?: boolean, propagationPolicy?: string, dryRun?: string, body?: V1DeleteOptions, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural, name })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling deleteNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling deleteNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling deleteNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling deleteNamespacedCustomObject.')
    }

    // verify required parameter 'name' is not null or undefined
    if (name === null || name === undefined) {
      throw new Error('Required parameter name was null or undefined when calling deleteNamespacedCustomObject.')
    }

    if (gracePeriodSeconds !== undefined) {
      localVarQueryParameters.gracePeriodSeconds = ObjectSerializer.serialize(gracePeriodSeconds, 'number')
    }

    if (orphanDependents !== undefined) {
      localVarQueryParameters.orphanDependents = ObjectSerializer.serialize(orphanDependents, 'boolean')
    }

    if (propagationPolicy !== undefined) {
      localVarQueryParameters.propagationPolicy = ObjectSerializer.serialize(propagationPolicy, 'string')
    }

    if (dryRun !== undefined) {
      localVarQueryParameters.dryRun = ObjectSerializer.serialize(dryRun, 'string')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'DELETE',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(body, 'V1DeleteOptions'),
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }

  /**
     * Returns a namespace scoped custom object
     * @param group the custom resource\&#39;s group
     * @param version the custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural the custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param name the custom object\&#39;s name
     */
  public async getNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, name: string, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural, name })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling getNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling getNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling getNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling getNamespacedCustomObject.')
    }

    // verify required parameter 'name' is not null or undefined
    if (name === null || name === undefined) {
      throw new Error('Required parameter name was null or undefined when calling getNamespacedCustomObject.')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'GET',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }

  /**
     * list or watch namespace scoped custom objects
     * @param group The custom resource\&#39;s group name
     * @param version The custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural The custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param pretty If \&#39;true\&#39;, then the output is pretty printed.
     * @param allowWatchBookmarks allowWatchBookmarks requests watch events with type \&quot;BOOKMARK\&quot;. Servers that do not implement bookmarks may ignore this flag and bookmarks are sent at the server\&#39;s discretion. Clients should not assume bookmarks are returned at any specific interval, nor may they assume the server will send any BOOKMARK event during a session. If this is not a watch, this field is ignored. If the feature gate WatchBookmarks is not enabled in apiserver, this field is ignored.
     * @param _continue The continue option should be set when retrieving more results from the server. Since this value is server defined, clients may only use the continue value from a previous query result with identical query parameters (except for the value of continue) and the server may reject a continue value it does not recognize. If the specified continue value is no longer valid whether due to expiration (generally five to fifteen minutes) or a configuration change on the server, the server will respond with a 410 ResourceExpired error together with a continue token. If the client needs a consistent list, it must restart their list without the continue field. Otherwise, the client may send another list request with the token received with the 410 error, the server will respond with a list starting from the next key, but from the latest snapshot, which is inconsistent from the previous list results - objects that are created, modified, or deleted after the first list request will be included in the response, as long as their keys are after the \&quot;next key\&quot;.  This field is not supported when watch is true. Clients may start a watch from the last resourceVersion value returned by the server and not miss any modifications.
     * @param fieldSelector A selector to restrict the list of returned objects by their fields. Defaults to everything.
     * @param labelSelector A selector to restrict the list of returned objects by their labels. Defaults to everything.
     * @param limit limit is a maximum number of responses to return for a list call. If more items exist, the server will set the &#x60;continue&#x60; field on the list metadata to a value that can be used with the same initial query to retrieve the next set of results. Setting a limit may return fewer than the requested amount of items (up to zero items) in the event all requested objects are filtered out and clients should only use the presence of the continue field to determine whether more results are available. Servers may choose not to support the limit argument and will return all of the available results. If limit is specified and the continue field is empty, clients may assume that no more results are available. This field is not supported if watch is true.  The server guarantees that the objects returned when using continue will be identical to issuing a single list call without a limit - that is, no objects created, modified, or deleted after the first request is issued will be included in any subsequent continued requests. This is sometimes referred to as a consistent snapshot, and ensures that a client that is using limit to receive smaller chunks of a very large result can ensure they see all possible objects. If objects are updated during a chunked list the version of the object that was present at the time the first list result was calculated is returned.
     * @param resourceVersion When specified with a watch call, shows changes that occur after that particular version of a resource. Defaults to changes from the beginning of history. When specified for list: - if unset, then the result is returned from remote storage based on quorum-read flag; - if it\&#39;s 0, then we simply return what we currently have in cache, no guarantee; - if set to non zero, then the result is at least as fresh as given rv.
     * @param resourceVersionMatch resourceVersionMatch determines how resourceVersion is applied to list calls. It is highly recommended that resourceVersionMatch be set for list calls where resourceVersion is set See https://kubernetes.io/docs/reference/using-api/api-concepts/#resource-versions for details.  Defaults to unset
     * @param timeoutSeconds Timeout for the list/watch call. This limits the duration of the call, regardless of any activity or inactivity.
     * @param watch Watch for changes to the described resources and return them as a stream of add, update, and remove notifications.
     */
  public async listNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, pretty?: string, allowWatchBookmarks?: boolean, _continue?: string, fieldSelector?: string, labelSelector?: string, limit?: number, resourceVersion?: string, resourceVersionMatch?: string, timeoutSeconds?: number, watch?: boolean, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json', 'application/json;stream=watch']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling listNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling listNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling listNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling listNamespacedCustomObject.')
    }

    if (pretty !== undefined) {
      localVarQueryParameters.pretty = ObjectSerializer.serialize(pretty, 'string')
    }

    if (allowWatchBookmarks !== undefined) {
      localVarQueryParameters.allowWatchBookmarks = ObjectSerializer.serialize(allowWatchBookmarks, 'boolean')
    }

    if (_continue !== undefined) {
      localVarQueryParameters.continue = ObjectSerializer.serialize(_continue, 'string')
    }

    if (fieldSelector !== undefined) {
      localVarQueryParameters.fieldSelector = ObjectSerializer.serialize(fieldSelector, 'string')
    }

    if (labelSelector !== undefined) {
      localVarQueryParameters.labelSelector = ObjectSerializer.serialize(labelSelector, 'string')
    }

    if (limit !== undefined) {
      localVarQueryParameters.limit = ObjectSerializer.serialize(limit, 'number')
    }

    if (resourceVersion !== undefined) {
      localVarQueryParameters.resourceVersion = ObjectSerializer.serialize(resourceVersion, 'string')
    }

    if (resourceVersionMatch !== undefined) {
      localVarQueryParameters.resourceVersionMatch = ObjectSerializer.serialize(resourceVersionMatch, 'string')
    }

    if (timeoutSeconds !== undefined) {
      localVarQueryParameters.timeoutSeconds = ObjectSerializer.serialize(timeoutSeconds, 'number')
    }

    if (watch !== undefined) {
      localVarQueryParameters.watch = ObjectSerializer.serialize(watch, 'boolean')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'GET',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }

  /**
     * patch the specified namespace scoped custom object
     * @param group the custom resource\&#39;s group
     * @param version the custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural the custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param name the custom object\&#39;s name
     * @param body The JSON schema of the Resource to patch.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param fieldManager fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint. This field is required for apply requests (application/apply-patch) but optional for non-apply patch types (JsonPatch, MergePatch, StrategicMergePatch).
     * @param force Force is going to \&quot;force\&quot; Apply requests. It means user will re-acquire conflicting fields owned by other people. Force flag must be unset for non-apply patch requests.
     */
  public async patchNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, name: string, body: object, dryRun?: string, fieldManager?: string, force?: boolean, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural, name })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling patchNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling patchNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling patchNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling patchNamespacedCustomObject.')
    }

    // verify required parameter 'name' is not null or undefined
    if (name === null || name === undefined) {
      throw new Error('Required parameter name was null or undefined when calling patchNamespacedCustomObject.')
    }

    // verify required parameter 'body' is not null or undefined
    if (body === null || body === undefined) {
      throw new Error('Required parameter body was null or undefined when calling patchNamespacedCustomObject.')
    }

    if (dryRun !== undefined) {
      localVarQueryParameters.dryRun = ObjectSerializer.serialize(dryRun, 'string')
    }

    if (fieldManager !== undefined) {
      localVarQueryParameters.fieldManager = ObjectSerializer.serialize(fieldManager, 'string')
    }

    if (force !== undefined) {
      localVarQueryParameters.force = ObjectSerializer.serialize(force, 'boolean')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'PATCH',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(body, 'object'),
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }

  /**
     * replace the specified namespace scoped custom object
     * @param group the custom resource\&#39;s group
     * @param version the custom resource\&#39;s version
     * @param namespace The custom resource\&#39;s namespace
     * @param plural the custom resource\&#39;s plural name. For TPRs this would be lowercase plural kind.
     * @param name the custom object\&#39;s name
     * @param body The JSON schema of the Resource to replace.
     * @param dryRun When present, indicates that modifications should not be persisted. An invalid or unrecognized dryRun directive will result in an error response and no further processing of the request. Valid values are: - All: all dry run stages will be processed
     * @param fieldManager fieldManager is a name associated with the actor or entity that is making these changes. The value must be less than or 128 characters long, and only contain printable characters, as defined by https://golang.org/pkg/unicode/#IsPrint.
     */
  public async replaceNamespacedCustomObject(group?: string, version: string, namespace: string, plural: string, name: string, body: object, dryRun?: string, fieldManager?: string, options: { headers: { [name: string]: string } } = { headers: {} }): Promise<{ response: http.IncomingMessage, body: object }> {
    const localVarPath = this.urlMaker({ group, version, namespace, plural, name })
    const localVarQueryParameters: any = {}
    const localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders)
    const produces = ['application/json']
    // give precedence to 'application/json'
    if (produces.indexOf('application/json') >= 0) {
      localVarHeaderParams.Accept = 'application/json'
    } else {
      localVarHeaderParams.Accept = produces.join(',')
    }
    const localVarFormParams: any = {}

    // verify required parameter 'group' is not null or undefined
    if (group === null || group === undefined) {
      throw new Error('Required parameter group was null or undefined when calling replaceNamespacedCustomObject.')
    }

    // verify required parameter 'version' is not null or undefined
    if (version === null || version === undefined) {
      throw new Error('Required parameter version was null or undefined when calling replaceNamespacedCustomObject.')
    }

    // verify required parameter 'namespace' is not null or undefined
    if (namespace === null || namespace === undefined) {
      throw new Error('Required parameter namespace was null or undefined when calling replaceNamespacedCustomObject.')
    }

    // verify required parameter 'plural' is not null or undefined
    if (plural === null || plural === undefined) {
      throw new Error('Required parameter plural was null or undefined when calling replaceNamespacedCustomObject.')
    }

    // verify required parameter 'name' is not null or undefined
    if (name === null || name === undefined) {
      throw new Error('Required parameter name was null or undefined when calling replaceNamespacedCustomObject.')
    }

    // verify required parameter 'body' is not null or undefined
    if (body === null || body === undefined) {
      throw new Error('Required parameter body was null or undefined when calling replaceNamespacedCustomObject.')
    }

    if (dryRun !== undefined) {
      localVarQueryParameters.dryRun = ObjectSerializer.serialize(dryRun, 'string')
    }

    if (fieldManager !== undefined) {
      localVarQueryParameters.fieldManager = ObjectSerializer.serialize(fieldManager, 'string')
    }

    (<any>Object).assign(localVarHeaderParams, options.headers)

    const localVarUseFormData = false

    const localVarRequestOptions: localVarRequest.Options = {
      method: 'PUT',
      qs: localVarQueryParameters,
      headers: localVarHeaderParams,
      uri: localVarPath,
      useQuerystring: this._useQuerystring,
      json: true,
      body: ObjectSerializer.serialize(body, 'object'),
    }

    let authenticationPromise = Promise.resolve()
    if (this.authentications.BearerToken.apiKey) {
      authenticationPromise = authenticationPromise.then(() => this.authentications.BearerToken.applyToRequest(localVarRequestOptions))
    }
    authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions))

    let interceptorPromise = authenticationPromise
    for (const interceptor of this.interceptors) {
      interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions))
    }

    return interceptorPromise.then(() => {
      if (Object.keys(localVarFormParams).length) {
        if (localVarUseFormData) {
          (<any>localVarRequestOptions).formData = localVarFormParams
        } else {
          localVarRequestOptions.form = localVarFormParams
        }
      }
      return new Promise<{ response: http.IncomingMessage, body: object }>((resolve, reject) => {
        localVarRequest(localVarRequestOptions, (error, response, body) => {
          if (error) {
            reject(error)
          } else {
            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
              body = ObjectSerializer.deserialize(body, 'object')
              resolve({ response, body })
            } else {
              reject(new HttpError(response, body, response.statusCode))
            }
          }
        })
      })
    })
  }
}
