package eu.tsalliance.streamer.commands;

import eu.tsalliance.streamer.console.Command;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;

public class CmdStop extends Command {
    private static final Logger logger = LoggerFactory.getLogger(CmdStop.class);

    public CmdStop() {
        super("stop", "", "Stops the streamer", Arrays.asList("exit", "quit", "q"));
    }

    @Override
    public void execute(String name, ArrayList<String> args) {
        logger.info("Goodbye!");
        System.exit(0);
    }
}
