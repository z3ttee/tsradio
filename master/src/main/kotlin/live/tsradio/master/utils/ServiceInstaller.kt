package live.tsradio.master.utils

import live.tsradio.master.files.Filesystem
import org.apache.commons.lang3.SystemUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File
import java.io.PrintWriter

class ServiceInstaller {
    private val logger: Logger = LoggerFactory.getLogger(ServiceInstaller::class.java)

    fun installAsService(username: String) {
        if(username.isEmpty() || username.isBlank() || username == "null") {
            logger.info("Name for the user is required in order to create files with right permissions.")
            return
        }

        if(!SystemUtils.IS_OS_LINUX) {
            logger.error("Install as service not supported on windows.")
            return
        }

        try {
            logger.info("Installing service...")
            if(!Filesystem.scriptsDirectory.exists()) Filesystem.scriptsDirectory.mkdirs()

            val startScript = File(Filesystem.scriptsDirectory, "start.sh")
            val stopScript = File(Filesystem.scriptsDirectory, "stop.sh")

            startScript.setReadable(true)
            stopScript.setReadable(true)
            startScript.setWritable(true)
            stopScript.setWritable(true)

            val serviceFile = File("/etc/systemd/system/", "tsrm.service")
            serviceFile.setWritable(true)
            serviceFile.setReadable(true)

            if(serviceFile.exists()) {
                logger.error("Service file already exists. Consider backing up and deleting an older version before installing the new one.")
            } else {
                logger.info("Creating tsrm.service file...")
                serviceFile.createNewFile()
                if (!startScript.exists()) startScript.createNewFile()
                if (!stopScript.exists()) stopScript.createNewFile()

                val serviceWriter = PrintWriter(serviceFile)
                serviceWriter.println("[Unit]")
                serviceWriter.println("Description=TSR Master Service")
                serviceWriter.println("Requires=network.target")
                serviceWriter.println("After=network.target")
                serviceWriter.println(" ")
                serviceWriter.println("[Service]")
                serviceWriter.println("Type=forking")
                serviceWriter.println("Restart=on-failure")
                serviceWriter.println("RestartSec=3")
                serviceWriter.println("User=$username")
                serviceWriter.println("Group=$username")
                serviceWriter.println("ExecStart=" + startScript.absolutePath)
                serviceWriter.println("ExecStop=" + stopScript.absolutePath)
                serviceWriter.println(" ")
                serviceWriter.println("[Install]")
                serviceWriter.println("WantedBy=default.target")
                serviceWriter.flush()
                serviceWriter.close()
            }

            logger.info("Writing "+startScript.absolutePath)
            val startWriter = PrintWriter(startScript)
            startWriter.println("#!/usr/bin/bash")
            startWriter.println(" ")
            startWriter.println("if ! screen -list | grep -q \"tsrm\"; then")
            startWriter.println("    screen -dmS \"tsrm\" sh -c 'java -Xmx512M -Duser.dir="+Filesystem.rootDirectory.absolutePath+" -jar "+Filesystem.rootDirectory.absolutePath+File.separator+"master.jar; exec bash'")
            startWriter.println("fi")
            startWriter.flush()
            startWriter.close()

            logger.info("Writing "+stopScript.absolutePath)
            val stopWriter = PrintWriter(stopScript)
            stopWriter.println("#!/usr/bin/bash")
            stopWriter.println(" ")
            stopWriter.println("if screen -list | grep -q \"tsrm\"; then")
            stopWriter.println("    screen -X -S \"tsrm\" quit")
            stopWriter.println("fi")
            stopWriter.flush()
            stopWriter.close()

            logger.info("Setting permission for script files...")
            Runtime.getRuntime().exec("chmod 777 "+startScript.absolutePath)
            Runtime.getRuntime().exec("chmod 777 "+stopScript.absolutePath)
            Runtime.getRuntime().exec("chown "+username+" -R "+Filesystem.scriptsDirectory.absolutePath)
            Runtime.getRuntime().exec("chown "+username+" -R "+startScript.absolutePath)
            Runtime.getRuntime().exec("chown "+username+" -R "+stopScript.absolutePath)

            logger.info("Installation done. Master can be started using \"service tsrm start\".")
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }

}