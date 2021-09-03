# Formant Realtime Video Demo

This demo shows how to use the realtime-sdk and a closed source UI sdk from formant to create a realtime video app that can be embedded into Formant.

Quick Run

```
yarn
yarn start
```

To add this as a custom view for developing locally and testing:

1. Login to formant
2. Go to settings
3. Go to Views
4. Add new view and give the view a name
5. Click on the checkbox for custom view:
6. Set the URL of your custom view to: `http://localhost:3006/?device={device_id}&auth={auth}`
7. Check `URL should receive authorization`
8. Check `Show in single-device view`
9. Go to a device and select the view from the dropdown
10. Make sure your agent is running and that a teleop image stream is setup, then click the "Connect" button
