#!/bin/bash

readonly G_LOG_I='[INFO]'
readonly G_LOG_W='[WARN]'
readonly G_LOG_E='[ERROR]'

main() {
    # Run display manager and create a VNC server
    launch_xvfb
    launch_window_manager
    run_vnc_server &

    # Start ProcessEngine in gackground
    npm run jenkins-start-process-engine &

    # Start ChromeDriver and Selenium Hub via Webdriver in background
    node node_modules/webdriver-manager update
    node node_modules/webdriver-manager start &

    # Start BPMN-Studio in background
    npm start -- --port=9000 &

    # Wait for required resources to be up and running.
    echo "Waiting for SeleniumHub to start"
    while ! curl --silent localhost:4444; do sleep 1; done
    echo "Connection to Selenium Hub successful"

    echo "Waiting for BPMN-Studio to start"
    while ! curl --silent localhost:9000 > /dev/null; do sleep 1; done
    echo "Connection to BPMN-Studio successful"

    echo "Waiting for ProcessEngine to start"
    while ! curl --silent localhost:8000 > /dev/null; do sleep 1; done
    echo "Connection to ProcessEngine successful"

    # Run End-To-End tests
    npm run jenkins-run-end-to-end-tests
}

launch_xvfb() {
    # Set defaults if the user did not specify envs.
    export DISPLAY=${XVFB_DISPLAY:-:1}
    local screen=${XVFB_SCREEN:-0}
    local resolution=${XVFB_RESOLUTION:-1920x1080x24}
    local timeout=${XVFB_TIMEOUT:-5}

    # Start and wait for either Xvfb to be fully up or we hit the timeout.
    Xvfb ${DISPLAY} -screen ${screen} ${resolution} &
    local loopCount=0
    until xdpyinfo -display ${DISPLAY} > /dev/null 2>&1
    do
        loopCount=$((loopCount+1))
        sleep 1
        if [ ${loopCount} -gt ${timeout} ]
        then
            echo "${G_LOG_E} xvfb failed to start."
            exit 1
        fi
    done
}

launch_window_manager() {
    local timeout=${XVFB_TIMEOUT:-5}

    # Start and wait for either fluxbox to be fully up or we hit the timeout.
    fluxbox &
    local loopCount=0
    until wmctrl -m > /dev/null 2>&1
    do
        loopCount=$((loopCount+1))
        sleep 1
        if [ ${loopCount} -gt ${timeout} ]
        then
            echo "${G_LOG_E} fluxbox failed to start."
            exit 1
        fi
    done
}

run_vnc_server() {
    local passwordArgument='-nopw'

    if [ -n "${VNC_SERVER_PASSWORD}" ]
    then
        local passwordFilePath="${HOME}/x11vnc.pass"
        if ! x11vnc -storepasswd "${VNC_SERVER_PASSWORD}" "${passwordFilePath}"
        then
            echo "${G_LOG_E} Failed to store x11vnc password."
            exit 1
        fi
        passwordArgument=-"-rfbauth ${passwordFilePath}"
        echo "${G_LOG_I} The VNC server will ask for a password."
    else
        echo "${G_LOG_W} The VNC server will NOT ask for a password."
    fi

    x11vnc -display ${DISPLAY} -forever ${passwordArgument} &
    wait $!
}

control_c() {
    echo ""
    exit
}

trap control_c SIGINT SIGTERM SIGHUP

main

exit
