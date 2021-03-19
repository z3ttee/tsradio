package eu.tsalliance.streamer.commands;

import eu.tsalliance.streamer.console.Command;
import eu.tsalliance.streamer.console.CommandHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

public class CmdHelp extends Command {
    private static final Logger logger = LoggerFactory.getLogger(CmdHelp.class);

    public CmdHelp() {
        super("help", "", "Get more info about commands", Arrays.asList("h", "?"));
    }

    @Override
    public void execute(String name, ArrayList<String> args) {
        List<Command> listWithoutDuplicates = new ArrayList<>(new HashSet<>(CommandHandler.getCommands().values()));

        for(Command command : listWithoutDuplicates) {
            logger.info(command.getName() + command.getUsage() + " - "+command.getDescription());
        }
    }
}
