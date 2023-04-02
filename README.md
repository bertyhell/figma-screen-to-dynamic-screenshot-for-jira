# Figma screen to dynamic screenshot for Jira

This Chrome extension will convert the current page url in figma with a screen selected
into the thumbnail url for that screen (in Markdown format).

So you can paste it into a jira ticket and the screenshot will always be up-to-date.

## Operation

* Install the extension
* Pin the extension, so it is always visible (optional)
  * ![Shows arrow pointing to the extensions button in chrome and an arrow pointing to the pin extension button](readme_assets/pin-extension.png)
* Right-click the extension button
  * ![icon in chrome with arrow pointing to it](readme_assets/extension-icon.png)
* Set your [figma personal token](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens), so the extension can make calls to the Figma API
  * ![screenshot of the options screen containing the figma token input field, a checkbox to include the link and a save button](readme_assets/options.png)
* Go to a figma file and click one of the screen titles.
* The url should look like: figma.com/file/<fileKey>/<title>?node-id=<nodeId>
* Click the extension button. You should see the notification that the copy was successful:
  * ![Screenshot showing a successful notification after a copy to clipboard operation succeeded](readme_assets/notification.png)


The copied code will look like:
```markdown
![figma screen](https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/<imageId>)
https://www.figma.com/file/<fileKey>/<title>?node-id=<nodeId>
```
