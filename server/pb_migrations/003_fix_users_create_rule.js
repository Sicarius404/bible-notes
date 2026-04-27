migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.listRule = "id = @request.auth.id"
  collection.viewRule = "id = @request.auth.id"
  collection.createRule = ""
  collection.updateRule = "id = @request.auth.id"
  collection.deleteRule = ""

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.listRule = "id = @request.auth.id"
  collection.viewRule = "id = @request.auth.id"
  collection.createRule = null
  collection.updateRule = "id = @request.auth.id"
  collection.deleteRule = null

  app.save(collection)
})
