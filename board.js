window.addEventListener('load', function (e) {
    var c = document.getElementById("xdoBoard");
    var ctx = c.getContext("2d");
    ctx.font = "30px Arial";

    var xPos = '', yPos = '';
    var xPosReady = false, dotDrawed = false;

    //!!! restore/save 是存储属性的，如fillStyle
    function initBoard() {
        ctx.strokeStyle = "red";
        ctx.fillStyle = "green"
        //horizontal line
        for (var i = 100; i < 1920; i += 100) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 10);
            ctx.stroke();

            ctx.fillText(i, i - 30, 40)

            ctx.beginPath()
            ctx.moveTo(i, 50);
            ctx.lineTo(i, 1080);
            ctx.stroke();
        }

        //vertical line
        for (var j = 100; j < 1080; j += 100) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(15, j);
            ctx.stroke();

            ctx.fillText(j, 20, j + 10);

            ctx.beginPath()
            ctx.moveTo(80, j);
            ctx.lineTo(1920, j);
            ctx.stroke();
        }

    }

    function cleanBoard() {

        dotDrawed = false;
        ctx.clearRect(0, 0, 1920, 1080);
        initBoard();
    }

    function resetBoard() {
        xPosReady = false;
        xPos = '';
        yPos = '';
        if (dotDrawed) {
            cleanBoard()
        }
    }


    document.body.addEventListener('keydown', function (e) {
        var code = e.code;
        if (code == 'Escape') //quit app
        {
            window.electronAPI.quitApp();
            reutrn;
        }

        if (!xPosReady) {
            if (code.indexOf('Digit') == 0) {
                xPos += code.slice(5)
            } else if (xPos != "" && code.indexOf('Key') == 0 && code.slice(3) == 'X') {
                if (xPos <= 1920) {
                    xPosReady = true;

                    ctx.beginPath();
                    ctx.fillStyle = "blue";
                    ctx.arc(xPos, 10, 10, 0, 2 * Math.PI);
                    ctx.fill();

                    dotDrawed = true;
                } else {
                    resetBoard()
                }
            } else {
                resetBoard()
            }
        } else {
            if (code.indexOf('Digit') == 0) {
                yPos += code.slice(5);
            } else if (code == 'Enter') {
                if (yPos <= 1080) {
                    cleanBoard();

                    ctx.beginPath();
                    ctx.fillStyle = "blue";
                    ctx.arc(xPos, yPos, 10, 0, 2 * Math.PI);
                    ctx.fill();

                    dotDrawed = true;

                    //单向通道 
                    window.electronAPI.sendBoardPos(xPos, yPos);
                    resetBoard()

                    //TODO: 为什么这里异步不会执行???
                    //async () => {
                    //    try {
                    //        await window.electronAPI.sendBoardPos(xPos, yPos);
                    //    } catch (err) {
                    //        console.error(err)
                    //    } finally {
                    //        resetBoard()
                    //    }

                    //}

                    //双向通道
                    //window.electronAPI.respSendBoardPos(xPos, yPos)
                    //async () => {
                    //    console.error(xPos)
                    //    try {
                    //        const resp =
                    //            await window.electronAPI.respSendBoardPos(xPos, yPos)
                    //        if (resp) {}
                    //        //不管成功还是失败都应该清理
                    //    } catch (err) {
                    //        console.error(err)
                    //    } finally {
                    //        resetBoard()
                    //    }
                    //}

                } else {
                    resetBoard();
                }
            } else {
                resetBoard();
            }
        }

    });

    initBoard();
});


