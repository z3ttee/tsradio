package eu.tsalliance.streamer.console;

import lombok.Getter;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public abstract class Command {
    private static final Logger logger = LoggerFactory.getLogger(CommandHandler.class);

    @Getter private final String name;
    @Getter private final String usage;
    @Getter private final String description;
    @Getter private final List<String> aliases;

    public Command(@NotNull String name, String usage, String description, @NotNull List<String> aliases) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.aliases = aliases;
    }

    public abstract void execute(String name, ArrayList<String> args);

    public void sendUsage() {
        logger.warn("Usage: " + this.getName() + " " + this.getUsage());
    }

}
