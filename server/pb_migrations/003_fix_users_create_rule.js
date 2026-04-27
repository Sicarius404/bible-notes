migrate((app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.setOptions({
    listRule: "id = @request.auth.id",
    viewRule: "id = @request.auth.id",
    createRule: "",
    updateRule: "id = @request.auth.id",
    deleteRule: "",
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("users")

  collection.setOptions({
    listRule: "id = @request.auth.id",
    viewRule: "id = @request.auth.id",
    createRule: null,
    updateRule: "id = @request.auth.id",
    deleteRule: null,
  })

  app.save(collection)
})
