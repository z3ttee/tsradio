package eu.tsalliance.streamer.commands;

import eu.tsalliance.streamer.Core;
import eu.tsalliance.streamer.console.Command;

import java.util.ArrayList;
import java.util.Collections;

public class CmdRestart extends Command {
    public CmdRestart() {
        super("restart", "", "Restart streamer", Collections.singletonList("rs"));
    }

    @Override
    public void execute(String name, ArrayList<String> args) {
        if(args.size() > 0) {
            this.sendUsage();
            return;
        }

        Core.restart();
    }
}
