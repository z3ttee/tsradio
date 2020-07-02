package live.tsradio.nodeserver.utils

import org.slf4j.Logger
import org.slf4j.LoggerFactory

class CMDInputFinder(private val cmdArguments: ArrayList<String>) {
    private val logger: Logger = LoggerFactory.getLogger(CMDInputFinder::class.java)

    fun findValue(attributeName: String, throwError: Boolean = false): String? {
        val formatedAttr = "-$attributeName"

        try {
            if(cmdArguments.contains(formatedAttr)){
                return cmdArguments[cmdArguments.indexOf(formatedAttr)+1]
            }
        } catch (ignored: Exception){
            ignored.printStackTrace()
        }
        if(throwError) logger.warn("Cannot find a value for attribute '$formatedAttr'. This could cause reduced functionality in further tasks. Please consider setting a value for that command line property")
        return null
    }

    fun findExists(attributeName: String, throwError: Boolean = false): Boolean {
        val formatedAttr = "-$attributeName"

        try {
            return cmdArguments.contains(formatedAttr)
        } catch (ignored: Exception){
            ignored.printStackTrace()
        }

        if(throwError) logger.warn("Cannot find a value for attribute '$formatedAttr'. This could cause reduced functionality in further tasks. Please consider setting a value for that command line property")
        return false
    }

    fun findTillNext(attributeName: String, throwError: Boolean = false): String? {
        val values: ArrayList<String> = ArrayList()
        val formatedAttr = "-$attributeName"

        try {
            if(cmdArguments.contains(formatedAttr)){
                val array: ArrayList<String> = ArrayList(cmdArguments.subList(cmdArguments.indexOf(formatedAttr)+1, cmdArguments.size))
                for(a in array){
                    if(a.startsWith("-")) break
                    values.add(a)
                }
                return values.joinToString(" ")
            }
        } catch (ignored: Exception){
            ignored.printStackTrace()
        }
        if(throwError) logger.warn("Cannot find a value for attribute '$formatedAttr'. This could cause reduced functionality in further tasks. Please consider setting a value for that command line property")
        return null
    }

}